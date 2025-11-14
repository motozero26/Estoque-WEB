
import React from 'react';

const Reports: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Relatórios</h1>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Módulo de Relatórios</h2>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                    Esta seção conterá vários relatórios, como alertas de estoque, tempo médio de reparo, produtos por status e produtos por fornecedor. 
                    Os relatórios poderão ser exportados para os formatos CSV e PDF.
                </p>
                <div className="mt-6 space-y-4">
                    <div className="p-4 border rounded-lg dark:border-gray-700">Alertas de Estoque</div>
                    <div className="p-4 border rounded-lg dark:border-gray-700">Tempo Médio de Reparo</div>
                    <div className="p-4 border rounded-lg dark:border-gray-700">Produtos por Fornecedor</div>
                </div>
            </div>
        </div>
    );
};

export default Reports;