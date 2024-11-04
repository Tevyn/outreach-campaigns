import React, { useState, useEffect } from 'react';
import { Box, Heading, Grid, Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, FormControl, FormLabel, Input, Select, Checkbox, VStack, Text, IconButton, Flex, Link, Textarea, Progress } from '@chakra-ui/react';
import { EditIcon, AddIcon } from '@chakra-ui/icons';
import { useVoterSegments } from './VoterSegments';
import { Link as RouterLink } from 'react-router-dom';

const phases = ['Awareness', 'Contact', 'Get Out The Vote'];
const weeks = Array.from({ length: 12 }, (_, i) => i + 1);
const channels = ['Door Knocking', 'Direct Mail', 'Phone Banking', 'Digital Advertising', 'Texting', 'Events & Rallies', 'Yard Signs'];
const touchesPerVoterOptions = [0.25, 0.33, 0.5, 0.67, 0.75, 1];

interface Campaign {
  id: number;
  name: string;
  channel: string;
  weeks: number[];
  voterSegmentId: number;
  touchesPerVoter: number;
  contacts: number;
  script: string;
  actualContacts: { [week: number]: number };
}

const OutreachCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newCampaign, setNewCampaign] = useState<Campaign>({
    id: 0,
    name: '',
    channel: '',
    weeks: [],
    voterSegmentId: 0,
    touchesPerVoter: 0.25,
    contacts: 0,
    script: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    actualContacts: {}
  });
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [currentScript, setCurrentScript] = useState('');
  const [currentScriptCampaign, setCurrentScriptCampaign] = useState('');
  const [isEditingScript, setIsEditingScript] = useState(false);
  const { segments } = useVoterSegments();
  const [isLogContactsModalOpen, setIsLogContactsModalOpen] = useState(false);
  const [currentLoggingCampaign, setCurrentLoggingCampaign] = useState<Campaign | null>(null);
  const [contactsToLog, setContactsToLog] = useState(0);
  const [currentLoggingWeek, setCurrentLoggingWeek] = useState<number | null>(null);

  // Load campaigns from localStorage on component mount
  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = () => {
    const storedCampaigns = localStorage.getItem('campaigns');
    if (storedCampaigns) {
      setCampaigns(JSON.parse(storedCampaigns));
    }
  };

  const saveCampaigns = (campaignsToSave: Campaign[]) => {
    localStorage.setItem('campaigns', JSON.stringify(campaignsToSave));
    setCampaigns(campaignsToSave);
  };

  const handleCreateOrUpdateCampaign = () => {
    const updatedCampaign = {
      ...newCampaign,
      contacts: calculateContacts(newCampaign.voterSegmentId, newCampaign.touchesPerVoter)
    };

    let updatedCampaigns: Campaign[];
    if (editingCampaign) {
      updatedCampaigns = campaigns.map(c => c.id === editingCampaign.id ? updatedCampaign : c);
    } else {
      updatedCampaigns = [...campaigns, { ...updatedCampaign, id: Date.now(), actualContacts: {} }];
    }

    saveCampaigns(updatedCampaigns);

    setNewCampaign({
      id: 0,
      name: '',
      channel: '',
      weeks: [],
      voterSegmentId: 0,
      touchesPerVoter: 0.25,
      contacts: 0,
      script: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      actualContacts: {}
    });
    setEditingCampaign(null);
    onClose();
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setNewCampaign({
      ...campaign,
      contacts: calculateContacts(campaign.voterSegmentId, campaign.touchesPerVoter)
    });
    onOpen();
  };

  const handleWeekToggle = (week: number) => {
    setNewCampaign(prev => ({
      ...prev,
      weeks: prev.weeks.includes(week)
        ? prev.weeks.filter(w => w !== week)
        : [...prev.weeks, week].sort((a, b) => a - b)
    }));
  };

  const getCampaignProgress = (campaign: Campaign, currentWeek: number) => {
    const startWeek = Math.min(...campaign.weeks);
    const endWeek = Math.max(...campaign.weeks);
    const totalWeeks = endWeek - startWeek + 1;
    const currentCampaignWeek = currentWeek - startWeek + 1;
    return `Week ${currentCampaignWeek} of ${totalWeeks}`;
  };

  const handleOpenScript = (campaign: Campaign) => {
    setCurrentScript(campaign.script);
    setCurrentScriptCampaign(campaign.name);
    setIsScriptModalOpen(true);
    setIsEditingScript(false);
  };

  const handleEditScript = () => {
    setIsEditingScript(true);
  };

  const handleSaveScript = () => {
    setCampaigns(campaigns.map(c => c.name === currentScriptCampaign ? { ...c, script: currentScript } : c));
    setIsEditingScript(false);
  };

  const calculateContacts = (segmentId: number, touchesPerVoter: number) => {
    const segment = segments.find(s => s.id === segmentId);
    if (!segment) return 0;
    return Math.round((segment.votersInSegment || 0) * touchesPerVoter);
  };

  const handleVoterSegmentChange = (segmentId: number) => {
    setNewCampaign(prev => ({
      ...prev,
      voterSegmentId: segmentId,
      contacts: calculateContacts(segmentId, prev.touchesPerVoter)
    }));
  };

  const handleTouchesPerVoterChange = (touches: number) => {
    setNewCampaign(prev => ({
      ...prev,
      touchesPerVoter: touches,
      contacts: calculateContacts(prev.voterSegmentId, touches)
    }));
  };

  const handleOpenLogContacts = (campaign: Campaign, week: number) => {
    setCurrentLoggingCampaign(campaign);
    setCurrentLoggingWeek(week);
    setContactsToLog(0);
    setIsLogContactsModalOpen(true);
  };

  const handleLogContacts = () => {
    if (currentLoggingCampaign && currentLoggingWeek !== null) {
      const updatedCampaigns = campaigns.map(c => 
        c.id === currentLoggingCampaign.id 
          ? { 
              ...c, 
              actualContacts: { 
                ...c.actualContacts, 
                [currentLoggingWeek]: (c.actualContacts[currentLoggingWeek] || 0) + contactsToLog 
              } 
            } 
          : c
      );
      saveCampaigns(updatedCampaigns);
    }
    setIsLogContactsModalOpen(false);
  };

  const handleDeleteCampaign = () => {
    if (editingCampaign) {
      const updatedCampaigns = campaigns.filter(c => c.id !== editingCampaign.id);
      saveCampaigns(updatedCampaigns);
      setEditingCampaign(null);
      onClose();
    }
  };

  const renderCampaignBox = (campaign: Campaign, currentWeek: number) => {
    const boxWidth = '100%';
    const weeklyGoal = Math.round(campaign.contacts / campaign.weeks.length);
    const actualContacts = campaign.actualContacts[currentWeek] || 0;
    return (
      <Box key={`${campaign.id}-${currentWeek}`} width={boxWidth} bg="blue.50" p={2} borderRadius="md" boxShadow="sm" mb={2} ml={1} mr={1}>
        <Text fontSize="xs" mb={1}><strong>{getCampaignProgress(campaign, currentWeek)}</strong></Text>
        <Text fontWeight="bold" fontSize="sm">{campaign.name}</Text>
        <Text fontSize="xs" color="gray.600">{campaign.channel}</Text>
        <Text fontSize="xs"><strong>Weekly Goal:</strong> {weeklyGoal}</Text>
        <Text fontSize="xs"><strong>Actual:</strong> {actualContacts}</Text>
        <Progress value={(actualContacts / weeklyGoal) * 100} size="xs" mt={1} />
        <Flex justifyContent="space-between" alignItems="center" mt={1}>
          <Link fontSize="xs" color="blue.500" onClick={() => handleOpenScript(campaign)}>
            View Script
          </Link>
          <IconButton
            aria-label="Edit campaign"
            icon={<EditIcon />}
            size="xs"
            onClick={() => handleEditCampaign(campaign)}
          />
        </Flex>
        <Button size="xs" leftIcon={<AddIcon />} mt={2} onClick={() => handleOpenLogContacts(campaign, currentWeek)}>
          Log Contacts
        </Button>
      </Box>
    );
  };

  return (
    <Box p={8}>
      <Heading mb={6}>Outreach Campaigns</Heading>
      <Button colorScheme="blue" mb={6} onClick={() => { 
        setEditingCampaign(null); 
        setNewCampaign({
          id: 0,
          name: '',
          channel: '',
          weeks: [],
          voterSegmentId: 0,
          touchesPerVoter: 0.25,
          contacts: calculateContacts(0, 0.25),
          script: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          actualContacts: {}
        });
        onOpen(); 
      }}>Create Campaign</Button>
      {phases.map((phase, phaseIndex) => (
        <Box key={phase} mb={6}>
          <Heading size="md" mb={4}>{phase}</Heading>
          <Box borderWidth={1} borderRadius="md" overflow="hidden">
            <Flex>
              {weeks.slice(phaseIndex * 4, (phaseIndex + 1) * 4).map((week, index) => (
                <Box key={week} flex={1} borderRightWidth={index < 3 ? 1 : 0}>
                  <Box textAlign="center" fontWeight="bold" p={2} borderBottomWidth={1}>Week {week}</Box>
                  <Box p={2} minHeight="3rem">
                    <VStack spacing={2} align="stretch">
                      {campaigns.filter(c => c.weeks.includes(week)).map(campaign => {
                        return renderCampaignBox(campaign, week);
                      })}
                    </VStack>
                  </Box>
                </Box>
              ))}
            </Flex>
          </Box>
        </Box>
      ))}

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Campaign Name</FormLabel>
              <Input value={newCampaign.name} onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })} />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Channel</FormLabel>
              <Select value={newCampaign.channel} onChange={(e) => setNewCampaign({ ...newCampaign, channel: e.target.value })}>
                <option value="">Select a channel</option>
                {channels.map(channel => <option key={channel} value={channel}>{channel}</option>)}
              </Select>
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Weeks</FormLabel>
              <Grid templateColumns="repeat(6, 1fr)" gap={2}>
                {weeks.map(week => (
                  <Checkbox
                    key={week}
                    isChecked={newCampaign.weeks.includes(week)}
                    onChange={() => handleWeekToggle(week)}
                  >
                    Week {week}
                  </Checkbox>
                ))}
              </Grid>
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Voter Segment</FormLabel>
              <Select
                value={newCampaign.voterSegmentId}
                onChange={(e) => handleVoterSegmentChange(Number(e.target.value))}
              >
                {segments.map(segment => (
                  <option key={segment.id} value={segment.id}>
                    {segment.name} ({(segment.votersInSegment || 0).toLocaleString()} voters)
                  </option>
                ))}
              </Select>
              {segments.length === 1 && segments[0].id === 0 && (
                <Text mt={2} fontSize="sm" color="blue.500">
                  <Link as={RouterLink} to="/voter-segments">
                    Create a new voter segment
                  </Link>{' '}
                  to target specific groups of voters.
                </Text>
              )}
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Touches per Voter</FormLabel>
              <Select
                value={newCampaign.touchesPerVoter}
                onChange={(e) => handleTouchesPerVoterChange(Number(e.target.value))}
              >
                {touchesPerVoterOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Estimated Contacts</FormLabel>
              <Input value={newCampaign.contacts} isReadOnly />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Flex width="100%" justifyContent="space-between">
              {editingCampaign && (
                <Button colorScheme="red" variant="outline" onClick={handleDeleteCampaign}>
                  Delete Campaign
                </Button>
              )}
              <Flex>
                <Button colorScheme="blue" mr={3} onClick={handleCreateOrUpdateCampaign}>
                  {editingCampaign ? 'Update' : 'Create'}
                </Button>
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
              </Flex>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isScriptModalOpen} onClose={() => setIsScriptModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{currentScriptCampaign} Script</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {isEditingScript ? (
              <Textarea
                value={currentScript}
                onChange={(e) => setCurrentScript(e.target.value)}
                rows={10}
              />
            ) : (
              <Text>{currentScript}</Text>
            )}
          </ModalBody>
          <ModalFooter>
            {isEditingScript ? (
              <Button colorScheme="blue" mr={3} onClick={handleSaveScript}>
                Save
              </Button>
            ) : (
              <Button colorScheme="blue" mr={3} onClick={handleEditScript}>
                Edit
              </Button>
            )}
            <Button variant="ghost" onClick={() => setIsScriptModalOpen(false)}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isLogContactsModalOpen} onClose={() => setIsLogContactsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Log Contacts for {currentLoggingCampaign?.name} - Week {currentLoggingWeek}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Number of Contacts</FormLabel>
              <Input
                type="number"
                value={contactsToLog}
                onChange={(e) => setContactsToLog(Number(e.target.value))}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleLogContacts}>
              Log Contacts
            </Button>
            <Button variant="ghost" onClick={() => setIsLogContactsModalOpen(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default OutreachCampaigns;