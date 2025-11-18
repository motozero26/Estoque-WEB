import React, { useState, useEffect, useCallback } from 'react';
import { Product, Supplier, ProductPhoto } from '../types';
import * as api from '../services/api';
import { Plus, Edit, Trash, UploadCloud, AlertTriangle } from 'lucide-react';

const ProductForm: React.FC<{
    product: Product | null;
    suppliers: Supplier[];
    onSave: (product: Omit<Product, 'id' | 'createdAt'> | Product) => void;
    onCancel: () => void;
}> = ({ product, suppliers, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Omit<Product, 'id' | 'createdAt'>>({
        name: '',
        reference: '',
        description: '',
        supplierId: undefined,
        supplierName: '',
        status: 'novo',
        isUsable: true,
        cost: 0,
        qty: 1,
        minQty: 0,
        location: '',
        photos: [],
        dateEntry: new Date().toISOString().split('T')[0],
        tags: [],
        ...product,
    });
    const [photoPreviews, setPhotoPreviews] = useState<string[]>(product?.photos.map(p => p.url) || []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        setFormData(prev => {
            if (type === 'checkbox') {
                return { ...prev, [name]: (e.target as HTMLInputElement).checked };
            }
            
            if (type === 'number') {
                if (value === '') {
                    // Allow clearing optional number fields by setting them to undefined
                    if (name === 'cost' || name === 'minQty') {
                        return { ...prev, [name]: undefined };
                    }
                    // For required number fields like qty, fallback to 0 so the field doesn't break
                    return { ...prev, [name]: 0 };
                }
                const parsedValue = parseFloat(value);
                // If user types non-numeric text, don't update state.
                if (isNaN(parsedValue)) {
                    return prev;
                }
                return { ...prev, [name]: parsedValue };
            }

            // For all other input types
            return { ...prev, [name]: value };
        });
    };
    
    const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const supplierIdValue = e.target.value;
        if (supplierIdValue === "") {
             setFormData(prev => ({
                ...prev,
                supplierId: undefined,
                supplierName: ''
            }));
            return;
        }
        
        const supplierId = parseInt(supplierIdValue, 10);
        const supplier = suppliers.find(s => s.id === supplierId);
        setFormData(prev => ({
            ...prev,
            supplierId,
            supplierName: supplier?.name
        }));
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const newPhotos: ProductPhoto[] = files.map((file: File) => ({ url: URL.createObjectURL(file), name: file.name }));
            const newPreviews = newPhotos.map(p => p.url);

            setFormData(prev => ({ ...prev, photos: [...prev.photos, ...newPhotos] }));
            setPhotoPreviews(prev => [...prev, ...newPreviews]);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-3xl shadow-xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6">{product ? 'Editar' : 'Adicionar'} Produto</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="name" value={formData.name} onChange={handleChange} placeholder="Nome" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required />
                        <input name="reference" value={formData.reference} onChange={handleChange} placeholder="Referência" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required />
                        <select name="supplierId" value={formData.supplierId || ''} onChange={handleSupplierChange} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                            <option value="">Sem Fornecedor</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <select name="status" value={formData.status} onChange={handleChange} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                            <option value="novo">Novo</option>
                            <option value="usado">Usado</option>
                        </select>
                        <input name="qty" type="number" value={formData.qty} onChange={handleChange} placeholder="Quantidade" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        <input name="cost" type="number" step="0.01" value={formData.cost === undefined ? '' : formData.cost} onChange={handleChange} placeholder="Custo" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                         <input name="location" value={formData.location} onChange={handleChange} placeholder="Localização" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                         <input name="dateEntry" type="date" value={formData.dateEntry} onChange={handleChange} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Descrição" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    <div>
                        <label className="block mb-2 text-sm font-medium">Fotos</label>
                        <div className="border-2 border-dashed rounded-lg p-6 text-center relative">
                            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-600">Arraste e solte as fotos aqui, ou clique para selecionar</p>
                            <input type="file" multiple onChange={handlePhotoChange} className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"/>
                        </div>
                        <div className="mt-4 flex gap-4 flex-wrap">
                            {photoPreviews.map((src, index) => (
                                <img key={index} src={src} alt="preview" className="w-24 h-24 object-cover rounded"/>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ConfirmationModal: React.FC<{
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}> = ({ title, message, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl">
                <div className="flex items-center">
                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="ml-4">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                            {title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {message}
                        </p>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Excluir
                    </button>
                </div>
            </div>
        </div>
    );
};


const Products: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [productsData, suppliersData] = await Promise.all([api.getProducts(), api.getSuppliers()]);
            setProducts(productsData);
            setSuppliers(suppliersData);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            alert("Não foi possível carregar os dados.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const handleSave = async (productData: Omit<Product, 'id' | 'createdAt'> | Product) => {
        try {
            if ('id' in productData) {
                const { id, createdAt, ...updateData } = productData;
                await api.updateProduct(id, updateData);
            } else {
                await api.createProduct(productData);
            }
            fetchData();
            setIsModalOpen(false);
            setEditingProduct(null);
        } catch (error) {
             console.error("Failed to save product:", error);
            alert(`Falha ao salvar produto: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
        }
    };

    const handleDelete = (product: Product) => {
        setProductToDelete(product);
    };

    const handleConfirmDelete = async () => {
        if (!productToDelete) return;
        try {
            await api.deleteProduct(productToDelete.id);
            fetchData();
        } catch (error) {
            console.error("Failed to delete product:", error);
            alert(`Falha ao excluir produto: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
        } finally {
            setProductToDelete(null);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Produtos</h1>
                <button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <Plus size={20}/> Adicionar Produto
                </button>
            </div>
            {loading ? (
                <p>Carregando...</p>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="p-4">Foto</th>
                                <th className="p-4">Nome</th>
                                <th className="p-4">Referência</th>
                                <th className="p-4">Fornecedor</th>
                                <th className="p-4">Qtd</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.id} className="border-b dark:border-gray-700">
                                    <td className="p-4">
                                        <img src={p.photos[0]?.url || 'https://picsum.photos/40'} alt={p.name} className="w-10 h-10 object-cover rounded"/>
                                    </td>
                                    <td className="p-4 font-medium">{p.name}</td>
                                    <td className="p-4 text-gray-500 dark:text-gray-400">{p.reference}</td>
                                    <td className="p-4">{p.supplierName || 'N/A'}</td>
                                    <td className="p-4">{p.qty}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${p.status === 'novo' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        <button onClick={() => { setEditingProduct(p); setIsModalOpen(true); }} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"><Edit size={16}/></button>
                                        <button onClick={() => handleDelete(p)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"><Trash size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {isModalOpen && <ProductForm product={editingProduct} suppliers={suppliers} onSave={handleSave} onCancel={() => { setIsModalOpen(false); setEditingProduct(null); }} />}
            {productToDelete && (
                <ConfirmationModal
                    title="Excluir Produto"
                    message={`Você tem certeza que deseja excluir o produto "${productToDelete.name}"? Esta ação não pode ser desfeita.`}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setProductToDelete(null)}
                />
            )}
        </div>
    );
};

export default Products;
