import React from 'react';
import { GrFormEdit } from 'react-icons/gr';
import { Item } from '@/types/models'; 

interface ParagraphContentProps {
  data: {
    name: string;
    description: string;
    showName: boolean;
    isDefault: boolean;
  };
  id: string;
  onEdit: (item: Item) => void;
}

const ParagraphContent: React.FC<ParagraphContentProps> = ({ data, id, onEdit }) => {
  return (
    <div className="relative">
      {data.showName && <div className="font-bold">{data.name}</div>}
      <div>{`${data.description?.slice(0, 100)}${data.description && data.description.length > 100 ? '...' : ''}`}</div>
      <button
        onClick={() => onEdit({ id, ...data, type: 'paragraph', content: '' })}
        className="absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-700"
      >
        <GrFormEdit className="text-xl" />
      </button>
    </div>
  );
};

export default ParagraphContent;
