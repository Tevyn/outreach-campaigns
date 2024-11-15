import React, { useState, useEffect, useCallback } from 'react';
import { Box, Heading, Grid, Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, FormControl, FormLabel, Input, Select, Checkbox, VStack, Text, IconButton, Flex, Link, Textarea, Progress, Alert, AlertIcon } from '@chakra-ui/react';
import { EditIcon, AddIcon, CheckIcon, InfoIcon } from '@chakra-ui/icons';
import { useVoterSegments } from './VoterSegments';
import { Link as RouterLink } from 'react-router-dom';

const phases = ['Awareness', 'Contact', 'Get Out The Vote'];
const weeks = Array.from({ length: 12 }, (_, i) => i + 1);
const channels = ['Door Knocking', 'Direct Mail', 'Phone Banking', 'Digital Advertising', 'Texting', 'Events & Rallies', 'Yard Signs'];
const COST_PER_TEXT = 0.035;

interface Campaign {
  id: number;
  name: string;
  channel: string;
  weeks: number[];
  voterSegmentId: number;
  script: string;
  actualContacts: { [week: number]: number };
  paidWeeks?: { [week: number]: boolean };
}

const OutreachCampaigns = () => {
  const [outreach, setCampaigns] = useState<Campaign[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newOutreach, setNewCampaign] = useState<Campaign>({
    id: 0,
    name: '',
    channel: '',
    weeks: [],
    voterSegmentId: 0,
    script: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    actualContacts: {},
    paidWeeks: {}
  });
  const [editingOutreach, setEditingCampaign] = useState<Campaign | null>(null);
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [currentScript, setCurrentScript] = useState('');
  const [currentScriptOutreach, setCurrentScriptCampaign] = useState('');
  const [isEditingScript, setIsEditingScript] = useState(false);
  const { segments } = useVoterSegments();
  const [isLogContactsModalOpen, setIsLogContactsModalOpen] = useState(false);
  const [currentLoggingOutreach, setCurrentLoggingCampaign] = useState<Campaign | null>(null);
  const [contactsToLog, setContactsToLog] = useState(0);
  const [currentLoggingWeek, setCurrentLoggingWeek] = useState<number | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentPaymentOutreach, setCurrentPaymentCampaign] = useState<Campaign | null>(null);
  const [currentPaymentWeek, setCurrentPaymentWeek] = useState<number | null>(null);

  const loadCampaigns = useCallback(() => {
    const storedOutreach = localStorage.getItem('campaigns');
    if (storedOutreach) {
      setCampaigns(JSON.parse(storedOutreach));
    } else {
      const defaultCampaigns = getDefaultCampaigns();
      saveCampaigns(defaultCampaigns);
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const saveCampaigns = (outreachToSave: Campaign[]) => {
    localStorage.setItem('campaigns', JSON.stringify(outreachToSave));
    setCampaigns(outreachToSave);
  };

  const handleCreateOrUpdateCampaign = () => {
    let updatedOutreach: Campaign[];
    if (editingOutreach) {
      updatedOutreach = outreach.map(c => c.id === editingOutreach.id ? newOutreach : c);
    } else {
      updatedOutreach = [...outreach, { ...newOutreach, id: Date.now(), actualContacts: {}, paidWeeks: {} }];
    }

    saveCampaigns(updatedOutreach);

    setNewCampaign({
      id: 0,
      name: '',
      channel: '',
      weeks: [],
      voterSegmentId: 0,
      script: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      actualContacts: {},
      paidWeeks: {}
    });
    setEditingCampaign(null);
    onClose();
  };

  const handleEditCampaign = (outreach: Campaign) => {
    setEditingCampaign(outreach);
    setNewCampaign(outreach);
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

  const getOutreachProgress = (outreach: Campaign, currentWeek: number) => {
    const startWeek = Math.min(...outreach.weeks);
    const endWeek = Math.max(...outreach.weeks);
    const totalWeeks = endWeek - startWeek + 1;
    const currentOutreachWeek = currentWeek - startWeek + 1;
    return `Week ${currentOutreachWeek} of ${totalWeeks}`;
  };

  const handleOpenScript = (outreach: Campaign) => {
    setCurrentScript(outreach.script);
    setCurrentScriptCampaign(outreach.name);
    setIsScriptModalOpen(true);
    setIsEditingScript(false);
  };

  const handleEditScript = () => {
    setIsEditingScript(true);
  };

  const handleSaveScript = () => {
    setCampaigns(outreach.map(c => c.name === currentScriptOutreach ? { ...c, script: currentScript } : c));
    setIsEditingScript(false);
  };

  const handleOpenLogContacts = (outreach: Campaign, week: number) => {
    setCurrentLoggingCampaign(outreach);
    setCurrentLoggingWeek(week);
    setContactsToLog(0);
    setIsLogContactsModalOpen(true);
  };

  const handleLogContacts = () => {
    if (currentLoggingOutreach && currentLoggingWeek !== null) {
      const updatedOutreach = outreach.map(c => 
        c.id === currentLoggingOutreach.id 
          ? { 
              ...c, 
              actualContacts: { 
                ...c.actualContacts, 
                [currentLoggingWeek]: (c.actualContacts[currentLoggingWeek] || 0) + contactsToLog 
              } 
            } 
          : c
      );
      saveCampaigns(updatedOutreach);
    }
    setIsLogContactsModalOpen(false);
  };

  const handleOpenPayment = (outreach: Campaign, week: number) => {
    setCurrentPaymentCampaign(outreach);
    setCurrentPaymentWeek(week);
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = () => {
    if (currentPaymentOutreach && currentPaymentWeek !== null) {
      const segment = segments.find(s => s.id === currentPaymentOutreach.voterSegmentId);
      const targetContacts = segment?.votersInSegment || 0;
      
      const updatedOutreach = outreach.map(c =>
        c.id === currentPaymentOutreach.id
          ? {
              ...c,
              paidWeeks: {
                ...c.paidWeeks,
                [currentPaymentWeek]: true
              },
              actualContacts: {
                ...c.actualContacts,
                [currentPaymentWeek]: targetContacts
              }
            }
          : c
      );
      saveCampaigns(updatedOutreach);
    }
    setIsPaymentModalOpen(false);
  };

  const handleDeleteCampaign = () => {
    if (editingOutreach) {
      const updatedOutreach = outreach.filter(c => c.id !== editingOutreach.id);
      saveCampaigns(updatedOutreach);
      setEditingCampaign(null);
      onClose();
    }
  };

  const renderOutreachBox = (outreach: Campaign, currentWeek: number) => {
    const boxWidth = '100%';
    const actualContacts = outreach.actualContacts[currentWeek] || 0;
    const isPaid = outreach.paidWeeks?.[currentWeek];
    const segment = segments.find(s => s.id === outreach.voterSegmentId);
    const isPlaceholder = segment?.isPlaceholder;
    const cost = segment && !isPlaceholder ? (segment.votersInSegment * COST_PER_TEXT).toFixed(2) : '???';
    const totalWeeks = outreach.weeks.length;
    const targetContacts = segment && !isPlaceholder ? Math.ceil(segment.votersInSegment / totalWeeks) : 0;
    const progressValue = targetContacts > 0 ? (actualContacts / targetContacts) * 100 : 0;

    return (
      <Box key={`${outreach.id}-${currentWeek}`} width={boxWidth} bg="blue.50" p={2} borderRadius="md" boxShadow="sm" mb={2} ml={1} mr={1}>
        <Text fontSize="xs" mb={1}><strong>{getOutreachProgress(outreach, currentWeek)}</strong></Text>
        <Text fontWeight="bold" fontSize="sm">{outreach.name}</Text>
        <Text fontSize="xs" color="gray.600">{outreach.channel}</Text>
        <Progress value={progressValue} size="sm" colorScheme="green" mt={2} mb={2} />
        <Text fontSize="xs">
          <strong>Progress:</strong> {actualContacts.toLocaleString()} / {isPlaceholder ? "Unknown" : targetContacts.toLocaleString()}
          {totalWeeks > 1 && (
            <Text fontSize="xs" color="gray.600">
              ({targetContacts.toLocaleString()} per week for {totalWeeks} weeks)
            </Text>
          )}
        </Text>
        <Flex justifyContent="space-between" alignItems="center" mt={1}>
          <Link fontSize="xs" color="blue.500" onClick={() => handleOpenScript(outreach)}>
            View Script
          </Link>
        </Flex>
        <Flex justifyContent="space-between" alignItems="center" mt={2}>
          {outreach.channel === 'Texting' ? (
            isPaid ? (
              <Flex alignItems="center" color="green.500">
                <CheckIcon mr={1} />
                <Text fontSize="sm" fontWeight="medium">Payment Confirmed</Text>
              </Flex>
            ) : (
              <Button 
                size="xs" 
                colorScheme="blue" 
                onClick={() => handleOpenPayment(outreach, currentWeek)}
                isDisabled={isPlaceholder}
              >
                Pay ${cost} to send
              </Button>
            )
          ) : (
            <Button 
              size="xs" 
              leftIcon={<AddIcon />} 
              colorScheme="blue" 
              onClick={() => handleOpenLogContacts(outreach, currentWeek)}
              isDisabled={isPlaceholder}
            >
              Log Contacts
            </Button>
          )}
          <IconButton
            aria-label="Edit outreach"
            icon={<EditIcon />}
            size="xs"
            onClick={() => handleEditCampaign(outreach)}
          />
        </Flex>
      </Box>
    );
  };

  const hasUnsetRequiredSegments = () => {
    return segments.some(s => (s.id === 1 || s.id === 2) && s.isPlaceholder);
  };

  const getDefaultCampaigns = (): Campaign[] => {
    return [
      {
        id: 1,
        name: "Launch Event",
        channel: "Events & Rallies",
        weeks: [1],
        voterSegmentId: 1, // Base segment
        script: "Join us for our campaign launch event! Meet the candidate and learn about our vision for the future.",
        actualContacts: {},
        paidWeeks: {}
      },
      {
        id: 2,
        name: "Launch Text",
        channel: "Texting",
        weeks: [2],
        voterSegmentId: 0, // All voters
        script: "Our campaign has officially launched! Visit our website to learn more about our vision for the community.",
        actualContacts: {},
        paidWeeks: {}
      },
      {
        id: 3,
        name: "Persuadables Canvassing",
        channel: "Door Knocking",
        weeks: [5, 6, 7, 8],
        voterSegmentId: 2, // Persuadables segment
        script: "Hi! I'm volunteering with [Candidate]'s campaign. Do you have a few minutes to discuss the upcoming election?",
        actualContacts: {},
        paidWeeks: {}
      },
      {
        id: 4,
        name: "GOTV Text",
        channel: "Texting",
        weeks: [9],
        voterSegmentId: 1, // Base segment
        script: "Election day is coming up! Make your voice heard by voting for [Candidate] on [Election Date].",
        actualContacts: {},
        paidWeeks: {}
      },
      {
        id: 5,
        name: "Persuadables Text",
        channel: "Texting",
        weeks: [9],
        voterSegmentId: 2, // Persuadables segment
        script: "Election day is approaching! Learn more about [Candidate]'s vision at [Website].",
        actualContacts: {},
        paidWeeks: {}
      },
      {
        id: 6,
        name: "Election Day Text",
        channel: "Texting",
        weeks: [12],
        voterSegmentId: 0, // All voters
        script: "Today is election day! Polls are open until [Time]. Your polling location is [Location]. Every vote counts!",
        actualContacts: {},
        paidWeeks: {}
      }
    ];
  };

  return (
    <Box p={8}>
      <Heading mb={6}>Campaign Calendar</Heading>
      {hasUnsetRequiredSegments() && (
        <Alert status="info" mb={6}>
          <AlertIcon />
          <Box>
            <Text>
              Before scheduling targeted outreach, you'll need to <Link as={RouterLink} to="/voter-segments" color="blue.500">set up your voter segments</Link>. This helps you effectively reach different groups of voters.
            </Text>
          </Box>
        </Alert>
      )}
      <Button leftIcon={<AddIcon />} colorScheme="blue" mb={6} onClick={() => { 
        setEditingCampaign(null); 
        setNewCampaign({
          id: 0,
          name: '',
          channel: '',
          weeks: [],
          voterSegmentId: 0,
          script: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          actualContacts: {},
          paidWeeks: {}
        });
        onOpen(); 
      }}>Schedule Outreach</Button>
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
                      {outreach.filter(c => c.weeks.includes(week)).map(outreach => {
                        return renderOutreachBox(outreach, week);
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
          <ModalHeader>{editingOutreach ? 'Edit Outreach' : 'Schedule New Outreach'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>            
            {hasUnsetRequiredSegments() && (
              <Alert status="info" mb={4}>
                <AlertIcon />
                <Box>
                  <Text>
                    Before scheduling targeted outreach, you'll need to <Link as={RouterLink} to="/voter-segments" color="blue.500">set up your voter segments</Link>. This helps you effectively reach different groups of voters.
                  </Text>
                </Box>
              </Alert>
            )}
            <FormControl>
              <FormLabel>Outreach Name</FormLabel>
              <Input value={newOutreach.name} onChange={(e) => setNewCampaign({ ...newOutreach, name: e.target.value })} />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Channel</FormLabel>
              <Select value={newOutreach.channel} onChange={(e) => setNewCampaign({ ...newOutreach, channel: e.target.value })}>
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
                    isChecked={newOutreach.weeks.includes(week)}
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
                value={newOutreach.voterSegmentId}
                onChange={(e) => setNewCampaign({ ...newOutreach, voterSegmentId: Number(e.target.value) })}
              >
                {segments
                  .filter(segment => !(segment.id === 1 && segment.isPlaceholder) && !(segment.id === 2 && segment.isPlaceholder))
                  .map(segment => (
                    <option key={segment.id} value={segment.id}>
                      {segment.name} ({(segment.votersInSegment || 0).toLocaleString()} voters)
                    </option>
                  ))}
              </Select>
            </FormControl>
            {segments.length === 1 && segments[0].id === 0 && (
              <Flex mt={2} alignItems="center" color="blue.500">
                <InfoIcon mr={2} />
                <Link as={RouterLink} to="/voter-segments">
                  Create a voter segment to target specific groups of voters
                </Link>
              </Flex>
            )}
            {newOutreach.channel === 'Texting' && (
              <Box mt={4} p={4} bg="blue.50" borderRadius="md">
                <Text fontWeight="bold">Estimated Cost</Text>
                <Text>
                  {segments.find(s => s.id === newOutreach.voterSegmentId)?.votersInSegment || 0} voters × ${COST_PER_TEXT.toFixed(3)} per text = 
                  ${((segments.find(s => s.id === newOutreach.voterSegmentId)?.votersInSegment || 0) * COST_PER_TEXT).toFixed(2)}
                </Text>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Flex width="100%" justifyContent="space-between">
              {editingOutreach && (
                <Button colorScheme="red" variant="outline" onClick={handleDeleteCampaign}>
                  Delete Outreach
                </Button>
              )}
              <Flex>
                <Button 
                  colorScheme="blue" 
                  mr={3} 
                  onClick={handleCreateOrUpdateCampaign}
                >
                  {editingOutreach ? 'Update' : 'Schedule'}
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
          <ModalHeader>{currentScriptOutreach} Script</ModalHeader>
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
          <ModalHeader>Log Contacts for {currentLoggingOutreach?.name} - Week {currentLoggingWeek}</ModalHeader>
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

      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Payment for {currentPaymentOutreach?.name} - Week {currentPaymentWeek}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {currentPaymentOutreach && (
              <Text>
                Are you sure you want to pay ${(
                  (segments.find(s => s.id === currentPaymentOutreach.voterSegmentId)?.votersInSegment || 0) * COST_PER_TEXT
                ).toFixed(2)} for {
                  segments.find(s => s.id === currentPaymentOutreach.voterSegmentId)?.votersInSegment || 0
                } text messages?
              </Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleConfirmPayment}>
              Confirm Payment
            </Button>
            <Button variant="ghost" onClick={() => setIsPaymentModalOpen(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default OutreachCampaigns;