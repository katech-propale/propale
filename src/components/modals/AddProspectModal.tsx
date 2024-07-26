import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from 'react-modal';
import { companySchema } from '@/schemas/company';
import { FaTimes } from 'react-icons/fa';
import { z } from 'zod';
import axios from 'axios';
import { ROLES } from '@/constants/roles';
import dataApeCode from '../../data/codes-ape.json';
import { IoSnow } from "react-icons/io5";
import { Company } from '@/types/models';
import { CiFolderOn } from "react-icons/ci";

type AddProspectModalProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  onSubmit: (data: any) => Promise<string | null | undefined>;
  company: Company;
};

type FormInputs = z.infer<typeof companySchema>;

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '60%',
    padding: '2rem',
    borderRadius: '10px',
    maxHeight: '100vh',
    overflow: 'auto',
  },
};

const AddProspectModal: React.FC<AddProspectModalProps> = ({ isOpen, onRequestClose, onSubmit, company }) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormInputs>({
    resolver: zodResolver(companySchema),
  });
  const [messageAlertSiren, setMessageAlertSiren] = useState('');
  const [messageAlertEmail, setMessageAlertEmail] = useState('');
  setValue('role', ROLES.ADMIN);

  const onSubmitHandler = async (data: FormInputs) => {
    const result = await onSubmit(data);
    if (result === 'email_already_exists') {
      setMessageAlertEmail('Un compte utilisateur existe déjà pour cette adresse mail.');
      return;
    }
    reset();
  };

  const sirenValue = watch('siren');

  useEffect(() => {
    const fetchCompanyDetails = async (siren: string) => {
      try {
        const response = await axios.get(`https://api.insee.fr/entreprises/sirene/V3.11/siren/${siren}`, {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SIRENE_API_KEY}`,
          },
        });
        const companyData = response.data.uniteLegale;
        const apeCode = companyData.periodesUniteLegale[0].activitePrincipaleUniteLegale;
        setValue('apeCode', apeCode);
        const naf = dataApeCode.find(code => code.id === apeCode);
        if (naf) {
          setValue('activitySector', naf?.label);
        }

        const responseSearch = await axios.get(`https://recherche-entreprises.api.gouv.fr/search?q=${siren}`);
        const company = responseSearch.data.results[0].siege;
        setValue('address', `${company.numero_voie} ${company.type_voie} ${company.libelle_voie}`);
        setValue('city', company.libelle_commune);
        setValue('postalcode', company.code_postal);
        setValue('country', 'France');
      } catch (error) {
        console.error('Erreur lors de la récupération des informations de l’entreprise:', error);
      }
    };

    if (sirenValue && sirenValue.length === 9) {
      fetchCompanyDetails(sirenValue);
    } else {
      setMessageAlertSiren('');
      setValue('activitySector', '');
      setValue('apeCode', '');
      setValue('address', '');
      setValue('city', '');
      setValue('postalcode', '');
    }
  }, [sirenValue, setValue]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      overlayClassName="fixed inset-0 bg-black bg-opacity-90"
      ariaHideApp={false}
    >
      <div className="flex justify-end items-center pb-2 mb-4">
        <button onClick={onRequestClose}><FaTimes /></button>
      </div>
      <div className="flex flex-col justify-center items-center border-b pb-2 mb-4">
        <h2 className="text-xl font-semibold">Ajouter un prospect</h2>
        <div className='flex items-center justify-center text-labelGray mt-3'><CiFolderOn /> <p className='ml-2'>{company.name}</p></div>
      </div>
      <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Informations principales</h3>
          <div className="grid grid-cols-12 gap-4 mt-2">
            <div className="col-span-7">
              <label className="block text-sm font-medium text-labelGray">Raison sociale</label>
              <input
                {...register('companyName')}
                className="mt-1 block w-full rounded p-2 bg-backgroundGray"
                placeholder="Company tech"
              />
              {errors.companyName && <p className="text-red-500 text-xs">{errors.companyName.message}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-black">Statut</label>
              <div className="text-sm bg-blue-100 text-blue-600 border border-blue-600 px-5 py-1 rounded-full mt-1 flex items-center justify-center">Nouveau</div>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-black">Chaleur</label>
              <div className="text-sm bg-blue-100 text-blue-600 border border-blue-600 px-5 py-1 rounded-full mt-1 flex items-center justify-around">Froid <IoSnow /></div>
            </div>
            <div className="col-span-3">
              <label className="block text-sm font-medium text-labelGray">Numéro SIREN</label>
              <input
                {...register('siren')}
                className="mt-1 block w-full bg-backgroundGray rounded p-2"
                placeholder="123456789"
              />
              {errors.siren && <p className="text-red-500 text-xs">{errors.siren.message}</p>}
              {messageAlertSiren && <p className="text-red-500 text-xs">{messageAlertSiren}</p>}
            </div>

            <div className="col-span-3">
              <label className="block text-sm font-medium text-labelGray">Code APE</label>
              <input
                {...register('apeCode')}
                value={watch('apeCode')}
                className="mt-1 block w-full bg-backgroundGray rounded p-2"
                placeholder=""
                disabled
              />
              {errors.apeCode && <p className="text-red-500 text-xs">{errors.apeCode.message}</p>}
            </div>
            <div className="col-span-6">
              <label className="block text-sm font-medium text-labelGray">Secteur d’activité</label>
              <input
                {...register('activitySector')}
                value={watch('activitySector')}
                className="mt-1 block w-full bg-backgroundGray rounded p-2"
                placeholder=""
                disabled
              />
              {errors.activitySector && <p className="text-red-500 text-xs">{errors.activitySector.message}</p>}
            </div>
          </div>
        </div>

        <div className='mt-10'>
          <h3 className="text-lg font-medium">Contact principal</h3>
          <div className="grid grid-cols-12 gap-4 mt-2">
            <div className="col-span-3">
              <label className="block text-sm font-medium text-labelGray">Prénom</label>
              <input
                {...register('firstname')}
                className="mt-1 block w-full bg-backgroundGray rounded p-2"
                placeholder="Paul"
              />
              {errors.firstname && <p className="text-red-500 text-xs">{errors.firstname.message}</p>}
            </div>
            <div className="col-span-3">
              <label className="block text-sm font-medium text-labelGray">Nom</label>
              <input
                {...register('lastname')}
                className="mt-1 block w-full bg-backgroundGray rounded p-2"
                placeholder="Dupond"
              />
              {errors.lastname && <p className="text-red-500 text-xs">{errors.lastname.message}</p>}
            </div>
            <div className="col-span-6">
              <label className="block text-sm font-medium text-labelGray">Fonction</label>
              <input
                {...register('position')}
                className="mt-1 block w-full bg-backgroundGray rounded p-2"
                placeholder="commercial"
              />
              {errors.position && <p className="text-red-500 text-xs">{errors.position.message}</p>}
            </div>
            <div className="col-span-6">
              <label className="block text-sm font-medium text-labelGray">Email</label>
              <input
                {...register('email')}
                className={`mt-1 block w-full bg-backgroundGray rounded p-2 ${errors.email || messageAlertEmail ? 'border border-red-500' : ''}`}
                placeholder="paul.dupond@mail.com"
              />
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
              {messageAlertEmail && <p className="text-red-500 text-xs">{messageAlertEmail}</p>}
            </div>
            <div className="col-span-6">
              <label className="block text-sm font-medium text-labelGray">Téléphone</label>
              <input
                {...register('phone')}
                className="mt-1 block w-full bg-backgroundGray rounded p-2"
                placeholder="0762347533"
              />
              {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
            </div>
          </div>
        </div>
        {/* <div className="flex justify-between mt-4">
          <button type="button" className="text-blue-500">
            + Ajouter un contact
          </button>
        </div> */}
        <div className='flex justify-center'>
          <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 mt-4">
            Créer le prospect
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddProspectModal;