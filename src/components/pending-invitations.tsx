'use client';
import { useMutation, useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { useCanJoinTeamStore } from '@/lib/store';

import { Icons } from '@/components/icons';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { Button } from '../components/ui/button';
import { invitationSchemaType } from '../lib/schemas';
import useSession from '../lib/supabase/use-session';

interface InvitationsProps {
  role: string;
}

const Invitations = ({ role }: InvitationsProps) => {
  const session = useSession();
  const user = session?.user;
  const userId = user?.id;

  const [isLoading, setIsLoading] = useState(false);
  const {
    fetchTeamsJoined,
    canJoinMoreTeams,
    increaseTeamsJoined,
    teamsJoined,
  } = useCanJoinTeamStore();

  useEffect(() => {
    fetchTeamsJoined(userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  //fetch the invitations that are pending
  const { data: pendingInvitationsData, isLoading: pendingInvitationsLoading } =
    useQuery({
      queryKey: ['invitations', userId],
      queryFn: async () => {
        if (!userId) {
          return <h1>Not Logged in</h1>;
        }
        const response = await fetch(`/api/invitations/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        return await response.json();
      },
      retry: 10,
    });

  async function updateInvitation({
    status,
    inv_id,
  }: {
    status: string;
    inv_id: string;
  }) {
    //change the status of the invitation to accepted
    const response = await fetch(`/api/invitations/invitation/${inv_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: status, teams_joined: teamsJoined + 1 }),
    });

    if (response.status !== 200) {
      throw new Error('Failed to update invitation');
    }
  }

  const { mutate: invitationUpdate } = useMutation({
    mutationFn: updateInvitation,
    onSuccess: () => {
      toast.success('Invitation updated');
      setIsLoading(false);
    },
    onError: () => {
      toast.error('Failed to update invitation');
      setIsLoading(false);
    },
  });

  async function updateTeam({
    team_id,
    member_id,
  }: {
    team_id: string;
    member_id: string;
  }) {
    //also update the team to include this member
    const response = await fetch(`/api/teams/team/${team_id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ member_id: member_id }),
    });

    if (response.status !== 200) {
      throw new Error('Failed to update team');
    }
  }

  const { mutate: teamUpdate } = useMutation({
    mutationFn: updateTeam,
    onSuccess: () => {
      toast.success('Team Updated');
      increaseTeamsJoined();
    },
    onError: () => {
      toast.error('Failed to update team');
    },
  });

  async function handleAcceptance(
    inv_id: string,
    team_id: string,
    member_id: string
  ) {
    setIsLoading(true);
    if (role === 'TEAM_HEAD') {
      toast.error(
        'Team head cannot join team as a member. Either reject the invite or leave teams to join this one.'
      );
      setIsLoading(false);
      return;
    }
    //change the status of the invitation to accepted
    invitationUpdate({ status: 'ACCEPTED', inv_id: inv_id });

    //also update the team to include this member
    teamUpdate({ team_id: team_id, member_id: member_id });
  }

  async function handleRejection(inv_id: string) {
    setIsLoading(true);
    //change the status of the invitation to rejected
    invitationUpdate({ status: 'REJECTED', inv_id: inv_id });
  }

  return (
    <div>
      <h1 className='text-2xl font-bold'>Pending Invitations</h1>
      <div className='mt-2'>
        {pendingInvitationsLoading ? (
          <div className='flex justify-center items-center mt-32'>
            <Icons.spinner
              className='size-20 animate-spin text-primary-foreground rounded-md p-1'
              aria-hidden='true'
            />
          </div>
        ) : pendingInvitationsData.data?.length === 0 ? (
          <div className='mt-6 rounded-md border border-muted-foreground p-2'>
            <p className='text-muted-foreground text-sm text-center'>
              No pending invitations
            </p>
          </div>
        ) : (
          <div className='px-2 py-4 '>
            <div className='flex flex-col border-2 border-muted-foreground rounded-md'>
              {pendingInvitationsData.data?.map(
                (invitation: invitationSchemaType) => (
                  <div
                    key={invitation.inv_id}
                    className='flex items-center justify-between p-3'
                  >
                    <h3>{invitation.text}</h3>
                    <div>
                      {isLoading ? (
                        <Icons.spinner
                          className='mr-2 size-8 animate-spin text-primary-foreground rounded-md p-1'
                          aria-hidden='true'
                        />
                      ) : (
                        <div className='flex gap-3'>
                          <Tooltip>
                            <TooltipTrigger>
                              <Button
                                size='sm'
                                onClick={() => {
                                  handleAcceptance(
                                    invitation.inv_id,
                                    invitation.team_id,
                                    invitation.member_id
                                  );
                                }}
                                disabled={isLoading || !canJoinMoreTeams()}
                              >
                                <Icons.check className='size-4' />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {canJoinMoreTeams()
                                ? 'Accept'
                                : 'You can not join more than 3 teams. Please leave a team to join another.'}
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger>
                              <Button
                                size='sm'
                                variant='destructive'
                                onClick={() => {
                                  handleRejection(invitation.inv_id);
                                }}
                                disabled={isLoading}
                              >
                                <Icons.close className='size-4' />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Reject</TooltipContent>
                          </Tooltip>
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Invitations;
