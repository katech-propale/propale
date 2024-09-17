import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Company } from '@/types/models';
import { fetchCompanyById, fetchTopMostParentCompanyCompanyById } from '@/services/companyService';
import { useUser } from '@/context/userContext';
import Link from 'next/link';
import { FaArrowRight } from "react-icons/fa";
import { statuses, Option } from '@/constants';
import Header from '@/components/layout/Header';
import { getStepperSession } from '@/services/stepperService';
import { fetchCompanySettings } from '@/services/companySettingsService';
import ProspectNavBar from '@/components/clientPortal/ProspectNavBar';

const getStatusOption = (value: string) => statuses.find(status => status.value === value);

const ProgressBar: React.FC<{ percentage: number }> = ({ percentage }) => (
  <div className="w-full bg-gray-200 rounded-b-3xl h-2.5 mb-4 dark:bg-gray-700">
    <div 
      className={`bg-blueCustom h-2.5 ${percentage === 100 ? 'rounded-b-full' : 'rounded-bl-full'} dark:bg-blue-500`} 
      style={{ width: `${percentage}%` }}
    ></div>
  </div>
);

const Audit: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [statusOption, setStatusOption] = useState<Option>();
  const [workflowStatus, setWorkflowStatus] = useState<string>('not_started');
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);

  const loadData = useCallback(async () => {
    if (typeof id !== 'string' || !user?.id) return;

    setLoading(true);
    try {
      const company = await fetchCompanyById(id);
      setCompany(company);
      if (company?.status) {
        setStatusOption(getStatusOption(company.status));
      }

      const companySettings = await fetchTopMostParentCompanyCompanyById(id)
      if (companySettings) {
        const session = await getStepperSession(companySettings.id, user.id);
        if (session) {
          setWorkflowStatus(session.session.status);
  
          if (session.session.status === 'saved') {
            const settings = await fetchCompanySettings(companySettings.id);
            if (settings && settings.workflow) {
              const totalQuestions = settings.workflow.questions.length;
              const answeredQuestions = session.responses.length;
              const percentage = Math.round((answeredQuestions / totalQuestions) * 100);
              setCompletionPercentage(percentage);
            }
          }
          if (session.session.status === 'completed') {
            setCompletionPercentage(100)
          }
        }
      }
    } catch (err) {
      setError("Une erreur s'est produite lors du chargement des données");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;

  const getButtonText = () => {
    switch (workflowStatus) {
      case 'saved':
        return "Continuer l'audit";
      case 'completed':
        return "Voir les résultats";
      default:
        return "Démarrer l'audit";
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className='flex px-8 pt-5 bg-white'>
        {statusOption && <Header title={company?.name} badgeName={statusOption.label} badgeColor={statusOption.color} siren={company?.siren} />}
      </header>  

      <div className='flex justify-center mt-10'>
        <ProspectNavBar active="audit" prospectId={id as string} />
      </div>

      <div className="flex flex-1 items-center justify-center overflow-hidden">
        <main className="w-4/5 p-12 overflow-y-auto flex flex-col">
          <div className="flex-grow">
            <div className="bg-white px-4 rounded-t-2xl flex justify-between min-h-36">
              <div className='flex flex-col justify-start mt-5'>
                <h4 className="text-black text-2xl font-semibold mb-2">Workflow</h4>
                <h6 className="text-gray-400 text-base font-normal">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.</h6>
              </div>
              <div className='flex flex-col justify-start mt-5'>
                {(
                  <h4 className="text-blueCustom text-2xl text-center font-semibold mb-5">{completionPercentage}%</h4>
                )}
                <Link 
                  href={`/client-portal/workflow/${id}`}
                  className="text-sm flex items-center justify-center text-white bg-blueCustom py-2 px-2 rounded-lg text-center"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {getButtonText()}
                  <FaArrowRight className="ml-2" />
                </Link>
              </div>
            </div>
            <ProgressBar percentage={completionPercentage} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Audit;