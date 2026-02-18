"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { FileText, Save, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminContent() {
    const [contents, setContents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editValue, setEditValue] = useState("")

    useEffect(() => {
        fetchContent()
    }, [])

    const fetchContent = async () => {
        try {
            const res = await api.get('/content/admin/all');
            setContents(res.data);
        } catch (error) {
            console.error("Failed to fetch content", error);
        } finally {
            setLoading(false);
        }
    }

    const handleEdit = (content: any) => {
        setEditingId(content.id)
        setEditValue(JSON.stringify(content.content, null, 2))
    }

    const handleSave = async (content: any) => {
        try {
            const parsedContent = JSON.parse(editValue);
            await api.post('/content', {
                page_name: content.page_name,
                section_name: content.section_name,
                content: parsedContent,
                is_active: content.is_active
            });
            setEditingId(null);
            fetchContent(); // Refresh
        } catch (error) {
            alert("Invalid JSON or Save Failed");
            console.error(error);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <FileText className="h-6 w-6" /> Content Management
                </h1>
            </div>

            <div className="bg-slate-900 shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-slate-800">
                    <thead className="bg-slate-950">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Page
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Section
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Content Preview
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-slate-900 divide-y divide-slate-800">
                        {contents.map((content) => (
                            <tr key={content.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                    {content.page_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {content.section_name}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate">
                                    {editingId === content.id ? (
                                        <textarea
                                            className="w-full h-32 bg-slate-800 border-slate-700 rounded p-2 text-xs font-mono"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                        />
                                    ) : (
                                        <span className="font-mono text-xs">{JSON.stringify(content.content).substring(0, 50)}...</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {editingId === content.id ? (
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" onClick={() => handleSave(content)} className="bg-green-600 hover:bg-green-700">
                                                <Save className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                                                Cancel
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button size="sm" variant="ghost" onClick={() => handleEdit(content)} className="text-indigo-400 hover:text-indigo-300">
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {contents.length === 0 && !loading && (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                                    No active content sections found to edit.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
