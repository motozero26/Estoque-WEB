import { Supplier, Product, Client, ServiceOrder, ServiceOrderStatus, User } from '../types';
import { supabase, mapSupabaseUserToAppUser } from './supabaseClient';

// --- Auth & Users API ---

export const login = async (email: string, pass: string): Promise<User> => {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: pass,
    });

    if (authError) {
        throw authError; // Re-throw the original error to be caught by the UI
    }

    if (!authData.user) {
        throw new Error('Usuário não encontrado');
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

    if (profileError) {
        console.error("Login failed: could not fetch user profile.", profileError);
        await supabase.auth.signOut();
        throw new Error('Não foi possível carregar o perfil do usuário.');
    }
    
    return {
        id: profile.id,
        name: profile.name,
        email: profile.username,
        role: profile.role,
        createdAt: profile.created_at,
    };
};

export const getUsers = async (): Promise<User[]> => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;
    return data.map(profile => ({
        id: profile.id,
        name: profile.name,
        email: profile.username,
        role: profile.role,
        createdAt: profile.created_at,
    }));
};

export const createUser = async (userData: Omit<User, 'id' | 'createdAt'> & { password: string }) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
            data: {
                name: userData.name,
                role: userData.role,
            }
        }
    });
    if (authError) throw authError;
    if (!authData.user) throw new Error("Could not create user");
    
    return mapSupabaseUserToAppUser(authData.user, userData.role);
};

export const updateUser = async (id: string, data: Partial<Omit<User, 'id' | 'createdAt' | 'email'>>) => {
    const { data: updatedUser, error } = await supabase.from('profiles').update(data).eq('id', id).select().single();
    if (error) throw error;
    return updatedUser;
};

export const deleteUser = async (id: string) => {
    const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { user_id: id },
    });

    if (error) {
        console.error("Detailed error invoking delete-user function:", error);
        if (error.message.includes('Function not found')) {
            throw new Error('A função "delete-user" não foi encontrada. Verifique se ela foi criada com o nome exato e implantada no painel do Supabase.');
        }
        if (error.message.includes('Failed to send a request')) {
            throw new Error(
`ERRO CRÍTICO DE CORS: A exclusão falhou porque o backend (Supabase) bloqueou a requisição.

SOLUÇÃO (Ação Obrigatória):
1. Acesse seu painel do Supabase > Edge Functions > \`delete-user\`.
2. APAGUE todo o código existente.
3. COPIE e COLE o código exato fornecido na documentação para a função. O código correto INCLUI uma seção \`corsHeaders\` e um bloco \`if (req.method === 'OPTIONS')\`.
4. Clique em 'Save and deploy'.
5. Se o erro persistir, verifique os logs da função no painel para mais detalhes.`
            );
        }
        throw new Error(`Erro ao invocar a função: ${error.message}.`);
    }

    if (data?.error) {
        console.error("Error from within delete-user function:", data.error);
        throw new Error(`A função retornou um erro: ${data.error}`);
    }
    
    return { success: true };
};

// --- Mappers ---
const mapToApp = <T>(data: any, mapping: Record<string, string>): T => {
    const result: any = {};
    for (const key in data) {
        const newKey = Object.keys(mapping).find(k => mapping[k] === key) || key;
        result[newKey] = data[key];
    }
    return result as T;
};

const mapToDb = <T>(data: T, mapping: Record<string, string>): any => {
    const result: any = {};
    for (const key in data) {
        const newKey = mapping[key] || key;
        result[newKey] = (data as any)[key];
    }
    return result;
};

const supplierMapping = { taxId: 'tax_id', createdAt: 'created_at' };
const productMapping = { supplierId: 'supplier_id', supplierName: 'supplier_name', isUsable: 'is_usable', minQty: 'min_qty', dateEntry: 'date_entry', createdAt: 'created_at' };
const clientMapping = { cpfCnpj: 'cpf_cnpj', createdAt: 'created_at' };
const serviceOrderMapping = { osNumber: 'os_number', clientId: 'client_id', clientName: 'client_name', entryDate: 'entry_date', deliveryDate: 'delivery_date', warrantyDays: 'warranty_days', warrantyExpiresAt: 'warranty_expires_at', diagnosisInitial: 'diagnosis_initial', totalEstimated: 'total_estimated', totalFinal: 'total_final', technicianId: 'technician_id', technicianName: 'technician_name', createdAt: 'created_at', initialPhotos: 'initial_photos' };

// --- Suppliers API ---
export const getSuppliers = async (): Promise<Supplier[]> => {
    const { data, error } = await supabase.from('suppliers').select('*');
    if (error) throw error;
    return data.map(s => mapToApp(s, supplierMapping));
};
export const getSupplier = async (id: number): Promise<Supplier | null> => {
    const { data, error } = await supabase.from('suppliers').select('*').eq('id', id).single();
    if (error) throw error;
    return data ? mapToApp(data, supplierMapping) : null;
};
export const createSupplier = async (supplierData: Omit<Supplier, 'id' | 'createdAt'>): Promise<Supplier> => {
    const { data, error } = await supabase.from('suppliers').insert([mapToDb(supplierData, supplierMapping)]).select().single();
    if (error) throw error;
    return mapToApp(data, supplierMapping);
};
export const updateSupplier = async (id: number, supplierData: Partial<Supplier>): Promise<Supplier> => {
    const { data, error } = await supabase.from('suppliers').update(mapToDb(supplierData, supplierMapping)).eq('id', id).select().single();
    if (error) throw error;
    return mapToApp(data, supplierMapping);
};
export const deleteSupplier = async (id: number) => {
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
};

// --- Products API ---
export const getProducts = async (): Promise<Product[]> => {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    return data.map(p => mapToApp(p, productMapping));
};
export const getProduct = async (id: number): Promise<Product | null> => {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error) throw error;
    return data ? mapToApp(data, productMapping) : null;
};
export const createProduct = async (productData: Omit<Product, 'id' | 'createdAt'>): Promise<Product> => {
    const { data, error } = await supabase.from('products').insert([mapToDb(productData, productMapping)]).select().single();
    if (error) throw error;
    return mapToApp(data, productMapping);
};
export const updateProduct = async (id: number, productData: Partial<Product>): Promise<Product> => {
    const { data, error } = await supabase.from('products').update(mapToDb(productData, productMapping)).eq('id', id).select().single();
    if (error) throw error;
    return mapToApp(data, productMapping);
};
export const deleteProduct = async (id: number) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
};

// --- Clients API ---
export const getClients = async (): Promise<Client[]> => {
    const { data, error } = await supabase.from('clients').select('*');
    if (error) throw error;
    return data.map(c => mapToApp(c, clientMapping));
};
export const createClient = async (clientData: Omit<Client, 'id' | 'createdAt'>): Promise<Client> => {
    const { data, error } = await supabase.from('clients').insert([mapToDb(clientData, clientMapping)]).select().single();
    if (error) throw error;
    return mapToApp(data, clientMapping);
};

// --- Service Orders API ---
export const getServiceOrders = async (): Promise<ServiceOrder[]> => {
    const { data, error } = await supabase.from('service_orders').select('*');
    if (error) throw error;
    return data.map(o => mapToApp(o, serviceOrderMapping));
};

export const createServiceOrder = async (orderData: Omit<ServiceOrder, 'id' | 'createdAt' | 'osNumber' | 'clientName' | 'products' | 'status'>): Promise<ServiceOrder> => {
    const { data: client } = await supabase.from('clients').select('name').eq('id', orderData.clientId).single();
    
    const newOrderData = {
        ...orderData,
        clientName: client?.name || 'Unknown',
        products: [],
        status: ServiceOrderStatus.EmAberto,
    };
    
    const { data, error } = await supabase.from('service_orders').insert([mapToDb(newOrderData, serviceOrderMapping)]).select().single();
    if (error) throw error;
    return mapToApp(data, serviceOrderMapping);
};

export const assignServiceOrder = async (orderId: number, technicianId: string): Promise<ServiceOrder> => {
    const { data: profile, error: profileError } = await supabase.from('profiles').select('name').eq('id', technicianId).single();
    if (profileError) {
        console.error("Error fetching technician name:", profileError);
        throw new Error("Could not find technician profile.");
    }
    
    const technicianName = profile?.name || 'Técnico Desconhecido';
    const updateData = { technicianId, technicianName, status: ServiceOrderStatus.EmAndamento };

    const { data, error } = await supabase.from('service_orders').update(mapToDb(updateData, serviceOrderMapping)).eq('id', orderId).select().single();
    if (error) throw error;
    return mapToApp(data, serviceOrderMapping);
};

export const updateServiceOrderStatus = async (orderId: number, status: ServiceOrderStatus): Promise<ServiceOrder> => {
    const { data, error } = await supabase.from('service_orders').update({ status }).eq('id', orderId).select().single();
    if (error) throw error;
    return mapToApp(data, serviceOrderMapping);
};

export const addProductToServiceOrder = async (orderId: number, productId: number, qty: number): Promise<ServiceOrder> => {
    const { data: product } = await supabase.from('products').select('*').eq('id', productId).single();
    if (!product || product.qty < qty) throw new Error("Produto insuficiente em estoque.");
    
    await supabase.from('products').update({ qty: product.qty - qty }).eq('id', productId);

    const { data: order } = await supabase.from('service_orders').select('products').eq('id', orderId).single();
    const existingProducts = order?.products || [];
    const newProductEntry = {
        id: Date.now(),
        productId: product.id,
        productName: product.name,
        productReference: product.reference,
        qty: qty,
        unitCost: product.cost
    };
    const updatedProducts = [...existingProducts, newProductEntry];

    const { data: updatedOrder, error } = await supabase.from('service_orders').update({ products: updatedProducts }).eq('id', orderId).select().single();
    if (error) throw error;
    
    return mapToApp(updatedOrder, serviceOrderMapping);
};

// --- Reports API ---
export const getDashboardData = async () => {
    const results = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('suppliers').select('*', { count: 'exact', head: true }),
        supabase.from('clients').select('*', { count: 'exact', head: true }),
        supabase.from('service_orders').select('*', { count: 'exact', head: true }),
        supabase.from('service_orders').select('*').order('created_at', { ascending: false }).limit(5)
    ]);

    const [productsRes, suppliersRes, clientsRes, serviceOrdersRes, recentOrdersRes] = results;

    const anyError = productsRes?.error || suppliersRes?.error || clientsRes?.error || serviceOrdersRes?.error || recentOrdersRes?.error;
    if (anyError) {
        console.error("Dashboard data error:", anyError);
        throw new Error("Falha ao carregar dados do painel.");
    }

    const totalProducts = productsRes?.count ?? 0;
    const totalSuppliers = suppliersRes?.count ?? 0;
    const totalClients = clientsRes?.count ?? 0;
    const totalServiceOrders = serviceOrdersRes?.count ?? 0;
    const recentOrders = (recentOrdersRes?.data ?? []).map(o => mapToApp(o, serviceOrderMapping));
    
    return {
        totalProducts,
        totalSuppliers,
        totalClients,
        totalServiceOrders,
        recentOrders
    };
};
