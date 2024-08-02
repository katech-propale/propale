import { ColumnDef } from "@tanstack/react-table";
import { LiaSortSolid } from "react-icons/lia";
import { MoreVertical } from "lucide-react";
import { Button } from '@/components/common/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from '@/components/common/DropdownMenu';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { Company, Profile } from '@/types/models';
import { IoEyeOutline } from "react-icons/io5";
import Link from "next/link";

export const folderColumns = (handleEditCompany: (company: Company) => void, openModalCompany: (companyId: string) => void): ColumnDef<Company>[] => [
  {
    accessorKey: "name",
    id: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="flex items-center justify-start w-full p-0"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nom du dossier
        <LiaSortSolid className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "siren",
    id: "siren",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Siren
        <LiaSortSolid className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="lowercase">{row.getValue("siren")}</div>,
  },
  {
    accessorKey: "activity_sector",
    id: "activity_sector",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Secteur d’activité
        <LiaSortSolid className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="lowercase">{row.getValue("activity_sector")}</div>,
  },
  {
    accessorKey: "status",
    id: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Statut
        <LiaSortSolid className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <span className={`text-sm ${row.original.blocked ? 'bg-red-100 text-red-600 border border-red-600' : 'bg-green-100 text-green-600 border border-green-600'} px-5 py-1 rounded-full mt-5`}>{row.original.blocked ? 'Inactif' : 'Actif'}</span>
  },
  {
    id: "settings",
    enableHiding: false,
    cell: ({ row }) => (
      <Link href={`/dashboard/folders/${row.original.id}`}>
      <button className="flex items-center text-blue-500 border border-2 border-blue-500 py-2 px-4 rounded-lg shadow-md hover:bg-blue-100">
        Ouvrir l’espace client
        <IoEyeOutline className="ml-2" />
      </button>
      </Link>
    ),
  },
  {
    id: "menu",
    enableHiding: false,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleEditCompany(row.original)}>Modifier</DropdownMenuItem>
          <DropdownMenuItem onClick={() => openModalCompany(row.original.id)}>Supprimer</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export const profileColumns = (handleEditUser: (user: Profile) => void, handleDeleteUser: (userId: string) => void): ColumnDef<Profile>[] => [
  {
    accessorKey: "name",
    id: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="flex items-center justify-start w-full p-0"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Utilisateur
        <LiaSortSolid className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="capitalize">{`${row.original.firstname} ${row.original.lastname}`}</div>
    ),
  },
  {
    accessorKey: "position",
    id: "position",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Fonction
        <LiaSortSolid className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="lowercase">{row.getValue("position")}</div>,
  },
  {
    accessorKey: "email",
    id: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Email
        <LiaSortSolid className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
  },
  {
    id: "menu",
    enableHiding: false,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleEditUser(row.original)}>Modifier</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDeleteUser(row.original.id)}>Supprimer</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];