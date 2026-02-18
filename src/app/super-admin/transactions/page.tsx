"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Search, Loader2, Download, Filter, DollarSign } from "lucide-react"
import toast from "react-hot-toast"
import Link from "next/link"

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        fetchTransactions()
    }, [])

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/super-admin/transactions')
            setTransactions(res.data)
        } catch (error) {
            console.error('Error fetching transactions:', error)
            toast.error("Failed to load transactions")
        } finally {
            setLoading(false)
        }
    }

    const filteredTransactions = transactions.filter(tx =>
        tx.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.stripe_payment_id?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
        }).format(amount)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-accent-blue" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue/50 text-sm w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Transaction ID</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Invoice</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredTransactions.length > 0 ? (
                                filteredTransactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                            {tx.stripe_payment_id ? (
                                                <span title={tx.stripe_payment_id}>
                                                    {tx.stripe_payment_id.substring(0, 16)}...
                                                </span>
                                            ) : (
                                                <span className="text-gray-300">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {tx.user ? (
                                                <Link href={`/super-admin/users/${tx.user_id}`} className="group">
                                                    <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                                        {tx.user.first_name || 'User'} {tx.user.last_name || ''}
                                                    </div>
                                                    <div className="text-gray-500 text-xs">{tx.user.email}</div>
                                                </Link>
                                            ) : (
                                                <span className="text-gray-400 italic">Deleted User</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {formatCurrency(tx.amount, tx.currency)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                ${tx.status === 'succeeded' ? 'bg-green-100 text-green-800' :
                                                    tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'}`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(tx.created_at).toLocaleDateString()}
                                            <span className="text-gray-400 text-xs ml-1">
                                                {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors" title="Download Invoice">
                                                <Download size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="bg-gray-50 rounded-full p-3 mb-3">
                                                <DollarSign className="w-6 h-6 text-gray-400" />
                                            </div>
                                            <p className="font-medium">No transactions found</p>
                                            <p className="text-sm text-gray-400 mt-1">Payment history will appear here.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
