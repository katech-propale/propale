import React, { useEffect, useState } from 'react';
import UserProfile from './UserProfile';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { MdFolderOpen } from "react-icons/md";
import { PiUsers } from "react-icons/pi";
import { SlSettings } from "react-icons/sl";
import Link from 'next/link';
import Image from 'next/image';
import { Company, Profile } from '@/types/models';
import { fetchCompanyById, fetchCompanyWithoutParentByProfileId } from '@/services/companyService';
import { fetchProfilesCountWithRoleSuperAdmin } from '@/services/userService';
import { ROLES } from '@/constants/roles';
import { useUser } from '@/context/userContext';
import { fetchProfileCountByCompanyId, updateUserProfile } from '@/services/profileService';
import { useRouter } from 'next/router';
import EditUserModal from '../modals/EditUserModal';
import { HiOutlineBuildingOffice } from "react-icons/hi2";
import { supabase } from '@/lib/supabaseClient';
import { HiMiniArrowLeftStartOnRectangle } from "react-icons/hi2";

interface SidebarProps {
  currentPage: string;
  setPage: (page: string) => void;
  isDashboardHome: boolean;
}

interface NavigationLinkProps {
  href: string;
  icon: React.ElementType;
  text: string;
  active?: boolean;
  count?: number;
  isCollapsed: boolean;
  onClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage = "folders", setPage, isDashboardHome }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [company, setCompany] = useState<Company>();
  const [profileCount, setProfileCount] = useState<number>(0);
  const { user, refetchUser } = useUser();
  const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN;
  const router = useRouter();
  const companyId = router.query.id;
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);

  const isProspect = router.pathname.startsWith('/dashboard/prospect');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };
  
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleEditUser = () => {
    setSelectedUser(user);
    setIsModalOpenEdit(true);
  };

  const handleCloseModalEdit = () => {
    setIsModalOpenEdit(false);
    setSelectedUser(null);
  };

  const handleSubmitEdit = async (data: Profile) => {
    if (user?.id) {
      const error = await updateUserProfile(data, user.id);
      if (error) {
        console.error('Error updating user profile:', error);
        return;
      }
    }
    await refetchUser()
    handleCloseModalEdit();
  };

  useEffect(() => {
    const getCompany = async () => {
      let companyData
      if (user) {
        if (companyId) {
          companyData = await fetchCompanyById(companyId as string)
        } else {
          companyData = await fetchCompanyWithoutParentByProfileId(user?.id);
        }
        if (companyData) {
          setCompany(companyData);
        }
      }
    };
    if (!isDashboardHome) {
      getCompany();
    }
    
  }, [user, isDashboardHome, companyId]);

  useEffect(() => {
    if (isSuperAdmin && isDashboardHome) {
      fetchProfilesCountWithRoleSuperAdmin().then(count => setProfileCount(count));
    } else if (company) {
      fetchProfileCountByCompanyId(isProspect && company?.company_id ? company.company_id : company?.id).then(count => setProfileCount(count));
    }
  }, [company, isDashboardHome, isSuperAdmin]);

  return (
    <div className={`min-h-screen bg-white flex flex-col items-center p-4 shadow-md ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <button onClick={toggleSidebar} className="self-end mb-4">
        {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
      </button>
      <Link href={isSuperAdmin ? '/dashboard' : `/dashboard/folders/${isProspect ? company?.company_id : company?.id}`} className="flex mb-6">
        <Image src="/logo.svg" alt="Propale" width={isCollapsed ? 30 : 40} height={isCollapsed ? 30 : 40} className="mr-2" />
        {!isCollapsed && <span className="text-2xl font-bold">Propale</span>}
      </Link>
      {user && <UserProfile user={user} isCollapsed={isCollapsed} handleEditUser={handleEditUser} />}
      {selectedUser && (
        <EditUserModal
          isOpen={isModalOpenEdit}
          onRequestClose={handleCloseModalEdit}
          onSubmit={handleSubmitEdit}
          defaultValues={selectedUser}
        />
      )}
      <nav className="mt-6 w-full">
        {(company || isDashboardHome) && (
          <>
            {isSuperAdmin && <NavigationLink
              href={'/dashboard'}
              icon={HiOutlineBuildingOffice}
              text="Clients"
              onClick={() => setPage("folders")}
              active={currentPage === "folders" && isDashboardHome}
              isCollapsed={isCollapsed}
            />}
            {!isDashboardHome && <NavigationLink
              href={`/dashboard/folders/${isProspect ? company?.company_id : company?.id}`}
              icon={MdFolderOpen}
              text="Mes dossiers"
              onClick={() => setPage("folders")}
              active={currentPage === "folders" && !isDashboardHome}
              isCollapsed={isCollapsed}
            />}
            <NavigationLink
              href={isSuperAdmin && isDashboardHome ? '/dashboard' : `/dashboard/users/${isProspect ? company?.company_id : company?.id}`}
              icon={PiUsers}
              text="Utilisateurs"
              onClick={() => setPage("users")}
              active={currentPage === "users"}
              count={profileCount}
              isCollapsed={isCollapsed}
            />
          </>
        )}
      </nav>
      <div className="mt-auto w-full">
      {isSuperAdmin && !isDashboardHome && <NavigationLink
          href={`/dashboard/settings/${isProspect ? company?.company_id : company?.id}`}
          icon={SlSettings}
          text="Paramètres"
          onClick={() => setPage("settings")}
          active={currentPage === "settings"}
          isCollapsed={isCollapsed}
        />}

        <div className='flex ml-3 cursor-pointer' onClick={handleLogout}>
          <div className='flex pt-5 mr-2'> 
            <HiMiniArrowLeftStartOnRectangle className='text-red-500' size={25}/>
          </div>
          <div className='flex'>
            <label className="mt-5 block text-base text-red-500 cursor-pointer">
              Se déconnecter
            </label>
          </div>
        </div>
      </div>

    </div>
  );
};

const NavigationLink: React.FC<NavigationLinkProps> = ({ href, icon: Icon, text, active = false, count, isCollapsed, onClick }) => {
  return (
    <Link href={href} className={`flex items-center ${isCollapsed ? 'p-2' : 'p-3'} rounded-md w-full ${active ? 'bg-blue-100 text-blueCustom' : 'text-gray-400 hover:bg-gray-100'}`} onClick={onClick}>
      <div><Icon className="mr-3" size="30" /></div>
      {!isCollapsed && <span className="flex-1">{text}</span>}
      {!isCollapsed && count && <span className={`text-sm ${active ? 'bg-blueCustom' : 'bg-gray-400'} rounded-md px-2 py-0.5 text-white`}>{count}</span>}
    </Link>
  );
};

export default Sidebar;
