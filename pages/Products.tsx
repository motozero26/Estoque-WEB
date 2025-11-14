import React, { useState, useEffect, useCallback } from 'react';
import { Product, Supplier, ProductPhoto } from '../types';
import * as api from '../services/api';
import { Plus, Edit, Trash, UploadCloud } from 'lucide-react';

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
        const isCheckbox = type === 'checkbox';
        const isNumber = type === 'number';

        setFormData(prev => ({ 
            ...prev, 
            [name]: isCheckbox ? (e.target as HTMLInputElement).checked : (isNumber ? parseFloat(value) : value)
        }));
    };
    
    const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const supplierId = parseInt(e.target.value, 10);
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
            // FIX: Explicitly type the `file` parameter in the map function to ensure correct type inference.
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
                <h2 className="text-2xl font-bold mb-6">{product ? 'Edit' : 'Add'} Product</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required />
                        <input name="reference" value={formData.reference} onChange={handleChange} placeholder="Reference" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required />
                        <select name="supplierId" value={formData.supplierId} onChange={handleSupplierChange} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                            <option value="">No Supplier</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <select name="status" value={formData.status} onChange={handleChange} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                            <option value="novo">New</option>
                            <option value="usado">Used</option>
                        </select>
                        <input name="qty" type="number" value={formData.qty} onChange={handleChange} placeholder="Quantity" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        <input name="cost" type="number" step="0.01" value={formData.cost} onChange={handleChange} placeholder="Cost" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                         <input name="location" value={formData.location} onChange={handleChange} placeholder="Location" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                         <input name="dateEntry" type="date" value={formData.dateEntry} onChange={handleChange} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    <div>
                        <label className="block mb-2 text-sm font-medium">Photos</label>
                        <div className="border-2 border-dashed rounded-lg p-6 text-center">
                            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-600">Drag & drop photos here, or click to select</p>
                            <input type="file" multiple onChange={handlePhotoChange} className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"/>
                        </div>
                        <div className="mt-4 flex gap-4 flex-wrap">
                            {photoPreviews.map((src, index) => (
                                <img key={index} src={src} alt="preview" className="w-24 h-24 object-cover rounded"/>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">Save</button>
                    </div>
                </form>
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

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [productsData, suppliersData] = await Promise.all([api.getProducts(), api.getSuppliers()]);
        setProducts(productsData);
        setSuppliers(suppliersData);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const handleSave = async (productData: Omit<Product, 'id' | 'createdAt'> | Product) => {
        if ('id' in productData) {
            await api.updateProduct(productData.id, productData);
        } else {
            await api.createProduct(productData);
        }
        fetchData();
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            await api.deleteProduct(id);
            fetchData();
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Products</h1>
                <button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <Plus size={20}/> Add Product
                </button>
            </div>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="p-4">Photo</th>
                                <th className="p-4">Name</th>
                                <th className="p-4">Reference</th>
                                <th className="p-4">Supplier</th>
                                <th className="p-4">Qty</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Actions</th>
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
                                        <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"><Trash size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {isModalOpen && <ProductForm product={editingProduct} suppliers={suppliers} onSave={handleSave} onCancel={() => { setIsModalOpen(false); setEditingProduct(null); }} />}
        </div>
    );
};

export default Products;