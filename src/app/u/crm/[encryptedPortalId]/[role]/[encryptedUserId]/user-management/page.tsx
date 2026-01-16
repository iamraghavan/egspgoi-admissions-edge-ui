'use client';

import { useState, useEffect, useCallback } from 'react';
import PageHeader from '@/components/page-header';
import { userColumns } from '@/components/users/columns';
import { getUsers, createUser, updateUser, deleteUser } from '@/lib/data';
import type { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { UserFormDialog } from '@/components/users/user-form-dialog';
import dynamic from 'next/dynamic';

const DataTable = dynamic(() => import('@/components/leads/data-table'), {
    loading: () => <Skeleton className="h-96 w-full" />,
    ssr: false
});

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setFormOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const { toast } = useToast();

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const fetchedUsers = await getUsers();
            setUsers(fetchedUsers);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Failed to fetch users',
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleCreate = () => {
        setSelectedUser(null);
        setFormOpen(true);
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setFormOpen(true);
    };

    const handleDelete = async (userId: string, type: 'soft' | 'hard') => {
        try {
            await deleteUser(userId, type);
            toast({
                title: `User ${type === 'soft' ? 'Deactivated' : 'Deleted'}`,
                description: `The user has been successfully ${type === 'soft' ? 'deactivated' : 'permanently deleted'}.`,
            });
            fetchUsers();
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Delete Failed',
                description: error.message,
            });
        }
    };
    
    const handleFormSubmit = async (userData: Partial<User>) => {
        try {
            if (selectedUser) {
                await updateUser(selectedUser.id, userData);
                toast({ title: 'User Updated', description: 'User details saved successfully.' });
            } else {
                await createUser(userData);
                toast({ title: 'User Created', description: 'New user has been created.' });
            }
            fetchUsers();
            return true;
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: selectedUser ? 'Update Failed' : 'Creation Failed',
                description: error.message,
            });
            return false;
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <PageHeader title="User Management" description="Manage all users in the system.">
                <Button onClick={handleCreate}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create User
                </Button>
            </PageHeader>
            <DataTable 
                columns={userColumns} 
                data={users}
                loading={loading}
                searchKey="name"
                searchPlaceholder="Filter by name or email..."
                meta={{
                    onEdit: handleEdit,
                    onDelete: handleDelete,
                }}
            />
            <UserFormDialog
                isOpen={isFormOpen}
                onOpenChange={setFormOpen}
                onSubmit={handleFormSubmit}
                user={selectedUser}
            />
        </div>
    );
}
