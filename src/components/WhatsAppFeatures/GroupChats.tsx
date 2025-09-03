import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Settings, Crown, Shield, User, MessageCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Group {
  id: string;
  name: string;
  description?: string;
  cover_image_url?: string;
  creator_id: string;
  members_count: number;
  privacy_level: string;
  created_at: string;
  is_member?: boolean;
  role?: string;
}

interface GroupMember {
  id: string;
  user_id: string;
  group_id: string;
  role: string;
  joined_at: string;
  profiles: {
    display_name: string;
    avatar_url?: string;
  };
}

export const GroupChats = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isGroupDetailOpen, setIsGroupDetailOpen] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      fetchGroups();
      fetchMyGroups();
    }
  }, [currentUser]);

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('privacy_level', 'public')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchMyGroups = async () => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          groups (
            id,
            name,
            description,
            cover_image_url,
            creator_id,
            members_count,
            privacy_level,
            created_at
          ),
          role
        `)
        .eq('user_id', currentUser.id);

      if (error) throw error;
      
      const groupsData = data?.map(item => ({
        ...item.groups,
        role: item.role,
        is_member: true
      })) || [];
      
      setMyGroups(groupsData);
    } catch (error) {
      console.error('Error fetching my groups:', error);
    }
  };

  const createGroup = async () => {
    if (!currentUser || !newGroupName.trim()) return;

    setLoading(true);
    try {
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: newGroupName,
          description: newGroupDescription,
          creator_id: currentUser.id,
          privacy_level: 'public',
          members_count: 1
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupData.id,
          user_id: currentUser.id,
          role: 'admin'
        });

      if (memberError) throw memberError;

      toast({
        title: "Group Created",
        description: `${newGroupName} has been created successfully!`
      });

      setNewGroupName('');
      setNewGroupDescription('');
      setIsCreateDialogOpen(false);
      fetchMyGroups();
      fetchGroups();
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async (groupId: string) => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: currentUser.id,
          role: 'member'
        });

      if (error) throw error;

      // Update members count
      await supabase
        .from('groups')
        .update({ 
          members_count: groups.find(g => g.id === groupId)?.members_count + 1 
        })
        .eq('id', groupId);

      toast({
        title: "Joined Group",
        description: "You've successfully joined the group!"
      });

      fetchGroups();
      fetchMyGroups();
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: "Error",
        description: "Failed to join group",
        variant: "destructive"
      });
    }
  };

  const fetchGroupMembers = async (groupId: string) => {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          *,
          profiles (
            display_name,
            avatar_url
          )
        `)
        .eq('group_id', groupId)
        .order('joined_at');

      if (error) throw error;
      setGroupMembers(data || []);
    } catch (error) {
      console.error('Error fetching group members:', error);
    }
  };

  const showGroupDetails = (group: Group) => {
    setSelectedGroup(group);
    fetchGroupMembers(group.id);
    setIsGroupDetailOpen(true);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'moderator':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const GroupCard = ({ group, isJoined = false }: { group: Group; isJoined?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={group.cover_image_url} />
            <AvatarFallback>
              {group.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <CardTitle className="text-lg">{group.name}</CardTitle>
              {isJoined && (
                <Badge variant="secondary" className="text-xs">
                  {group.role}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{group.members_count}</span>
              </span>
              <span>{formatDistanceToNow(new Date(group.created_at), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
        {group.description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {group.description}
          </p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex space-x-2">
          {isJoined ? (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => showGroupDetails(group)}
              >
                <Settings className="h-4 w-4 mr-1" />
                Manage
              </Button>
              <Button size="sm" className="flex-1">
                <MessageCircle className="h-4 w-4 mr-1" />
                Chat
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => joinGroup(group.id)}
              className="w-full"
              size="sm"
            >
              Join Group
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Groups</h2>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
              <Textarea
                placeholder="Group description (optional)"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                rows={3}
              />
              <Button 
                onClick={createGroup} 
                disabled={!newGroupName.trim() || loading}
                className="w-full"
              >
                {loading ? 'Creating...' : 'Create Group'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* My Groups */}
      {myGroups.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-primary">My Groups</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myGroups.map((group) => (
              <GroupCard key={group.id} group={group} isJoined={true} />
            ))}
          </div>
        </div>
      )}

      {/* Public Groups */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Discover Groups</h3>
        {groups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups
              .filter(group => !myGroups.some(myGroup => myGroup.id === group.id))
              .map((group) => (
                <GroupCard key={group.id} group={group} isJoined={false} />
              ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No groups available</h3>
              <p className="text-muted-foreground mb-4">
                Create the first group and invite others to join!
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Create Group
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Group Details Dialog */}
      <Dialog open={isGroupDetailOpen} onOpenChange={setIsGroupDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={selectedGroup?.cover_image_url} />
                <AvatarFallback>
                  {selectedGroup?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3>{selectedGroup?.name}</h3>
                <p className="text-sm text-muted-foreground font-normal">
                  {selectedGroup?.members_count} members
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedGroup?.description && (
            <p className="text-muted-foreground">{selectedGroup.description}</p>
          )}
          
          <div>
            <h4 className="font-semibold mb-3">Members ({groupMembers.length})</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {groupMembers.map((member) => (
                <div key={member.id} className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.profiles.avatar_url} />
                    <AvatarFallback>
                      {member.profiles.display_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{member.profiles.display_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {formatDistanceToNow(new Date(member.joined_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getRoleIcon(member.role)}
                    <span className="text-xs capitalize">{member.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};