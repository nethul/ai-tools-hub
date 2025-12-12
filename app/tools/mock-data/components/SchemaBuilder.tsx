import React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';

export interface SchemaItem {
    id: string;
    name: string;
    description: string;
}

interface SchemaBuilderProps {
    schema: SchemaItem[];
    setSchema: React.Dispatch<React.SetStateAction<SchemaItem[]>>;
}

export const SchemaBuilder: React.FC<SchemaBuilderProps> = ({ schema, setSchema }) => {
    const addColumn = () => {
        setSchema([
            ...schema,
            { id: crypto.randomUUID(), name: '', description: '' }
        ]);
    };

    const removeColumn = (id: string) => {
        setSchema(schema.filter(item => item.id !== id));
    };

    const updateColumn = (id: string, field: 'name' | 'description', value: string) => {
        setSchema(schema.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    return (
        <div className="space-y-4">
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="p-4 bg-slate-900/50 border-b border-slate-700 font-medium text-slate-300 grid grid-cols-12 gap-4">
                    <div className="col-span-1"></div>
                    <div className="col-span-4">Column Name</div>
                    <div className="col-span-6">Data Style / Description</div>
                    <div className="col-span-1"></div>
                </div>

                <div className="p-2 space-y-2">
                    {schema.map((item, index) => (
                        <div key={item.id} className="grid grid-cols-12 gap-4 items-center bg-slate-800 p-2 rounded-lg group hover:bg-slate-700/50 transition-colors">
                            <div className="col-span-1 flex justify-center cursor-move text-slate-600 hover:text-slate-400">
                                <GripVertical size={20} />
                            </div>
                            <div className="col-span-4">
                                <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => updateColumn(item.id, 'name', e.target.value)}
                                    placeholder="e.g. full_name"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-slate-600"
                                />
                            </div>
                            <div className="col-span-6">
                                <input
                                    type="text"
                                    value={item.description}
                                    onChange={(e) => updateColumn(item.id, 'description', e.target.value)}
                                    placeholder="e.g. Sri Lankan Names"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-slate-600"
                                />
                            </div>
                            <div className="col-span-1 flex justify-center">
                                <button
                                    onClick={() => removeColumn(item.id)}
                                    className="text-slate-500 hover:text-rose-500 transition-colors p-2 rounded-full hover:bg-rose-900/20"
                                    tabIndex={-1}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {schema.length === 0 && (
                        <div className="text-center py-8 text-slate-500 italic">
                            No columns added yet. Click below to start building your schema.
                        </div>
                    )}
                </div>
            </div>

            <button
                onClick={addColumn}
                className="w-full py-3 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:border-violet-500 hover:text-violet-400 hover:bg-violet-900/10 transition-all flex items-center justify-center gap-2 font-medium"
            >
                <Plus size={20} />
                Add Column
            </button>
        </div>
    );
};
