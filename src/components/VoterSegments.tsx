import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  Box,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  IconButton,
  Text,
  Checkbox,
  VStack,
  Alert,
  AlertIcon,
  FormErrorMessage,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';

// Export the VoterSegment interface
export interface VoterSegment {
  id: number;
  name: string;
  description: string;
  criteria: {
    party: string[];
    gender: string[];
    ageRange: string[];
    voteLikelihood: string[];
  };
  votersInSegment: number;
  votersWithAddress: number;
  votersWithPhone: number;
  isPlaceholder?: boolean;
}

// Create a context for voter segments
interface VoterSegmentContextType {
  segments: VoterSegment[];
  setSegments: React.Dispatch<React.SetStateAction<VoterSegment[]>>;
}

export const VoterSegmentContext = createContext<VoterSegmentContextType | undefined>(undefined);

export const useVoterSegments = () => {
  const context = useContext(VoterSegmentContext);
  if (!context) {
    throw new Error('useVoterSegments must be used within a VoterSegmentProvider');
  }
  return context;
};

const LOCAL_STORAGE_KEY = 'voterSegments';

export const VoterSegmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [segments, setSegments] = useState<VoterSegment[]>(() => {
    const storedSegments = localStorage.getItem(LOCAL_STORAGE_KEY);
    const parsedSegments = storedSegments ? JSON.parse(storedSegments) : [];
    
    // Ensure required segments exist
    const requiredSegments = [
      {
        id: 0,
        name: "All voters",
        description: "Contains all voters",
        criteria: {
          party: [],
          gender: [],
          ageRange: [],
          voteLikelihood: [],
        },
        votersInSegment: 5000,
        votersWithAddress: 4500,
        votersWithPhone: 4000,
      },
      {
        id: 1,
        name: "Base",
        description: "Your core voters who will likely support your campaign from the start",
        criteria: {
          party: [],
          gender: [],
          ageRange: [],
          voteLikelihood: [],
        },
        votersInSegment: 0,
        votersWithAddress: 0,
        votersWithPhone: 0,
        isPlaceholder: true
      },
      {
        id: 2,
        name: "Persuadables",
        description: "Voters who could be convinced to support your campaign with targeted messaging",
        criteria: {
          party: [],
          gender: [],
          ageRange: [],
          voteLikelihood: [],
        },
        votersInSegment: 0,
        votersWithAddress: 0,
        votersWithPhone: 0,
        isPlaceholder: true
      }
    ];

    // Add any missing required segments
    requiredSegments.forEach(required => {
      const exists = parsedSegments.find((s: VoterSegment) => s.name === required.name);
      if (!exists) {
        parsedSegments.push(required);
      }
    });
    
    return parsedSegments;
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(segments));
  }, [segments]);

  return (
    <VoterSegmentContext.Provider value={{ segments, setSegments }}>
      {children}
    </VoterSegmentContext.Provider>
  );
};

const VoterSegments: React.FC = () => {
  const { segments, setSegments } = useVoterSegments();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentSegment, setCurrentSegment] = useState<VoterSegment>({
    id: 0,
    name: '',
    description: '',
    criteria: {
      party: [],
      gender: [],
      ageRange: [],
      voteLikelihood: [],
    },
    votersInSegment: 0,
    votersWithAddress: 0,
    votersWithPhone: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [nameError, setNameError] = useState('');

  const handleOpenModal = (segment?: VoterSegment) => {
    if (segment) {
      setCurrentSegment(segment);
      setIsEditing(true);
    } else {
      const votersInSegment = Math.floor(Math.random() * (2000 - 500 + 1)) + 500;
      setCurrentSegment({
        id: Date.now(),
        name: '',
        description: '',
        criteria: {
          party: [],
          gender: [],
          ageRange: [],
          voteLikelihood: [],
        },
        votersInSegment: votersInSegment,
        votersWithAddress: Math.floor(votersInSegment * (Math.random() * (1 - 0.5) + 0.5)),
        votersWithPhone: Math.floor(votersInSegment * (Math.random() * (1 - 0.5) + 0.5)),
      });
      setIsEditing(false);
    }
    setNameError('');
    onOpen();
  };

  const handleSaveSegment = () => {
    if (!currentSegment.name.trim()) {
      setNameError('Name is required');
      return;
    }

    const updatedSegments = isEditing
      ? segments.map(s => {
          if (s.id === currentSegment.id) {
            if (s.id === 1 || s.id === 2) {
              const votersInSegment = Math.floor(Math.random() * (2000 - 500 + 1)) + 500;
              return {
                ...currentSegment,
                votersInSegment: s.criteria !== currentSegment.criteria ? votersInSegment : s.votersInSegment,
                votersWithAddress: s.criteria !== currentSegment.criteria ? Math.floor(votersInSegment * (Math.random() * (1 - 0.5) + 0.5)) : s.votersWithAddress,
                votersWithPhone: s.criteria !== currentSegment.criteria ? Math.floor(votersInSegment * (Math.random() * (1 - 0.5) + 0.5)) : s.votersWithPhone,
                isPlaceholder: false
              };
            } else {
              return { ...currentSegment, isPlaceholder: false };
            }
          }
          return s;
        })
      : [...segments, currentSegment];
    setSegments(updatedSegments);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSegments));
    onClose();
  };

  const handleDeleteSegment = (id: number) => {
    // Prevent deletion of "All voters", Base, and Persuadables segments
    if (id === 0 || id === 1 || id === 2) return;
    const updatedSegments = segments.filter(s => s.id !== id);
    setSegments(updatedSegments);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSegments));
  };

  const handleCriteriaChange = (criteriaType: keyof VoterSegment['criteria'], value: string) => {
    setCurrentSegment(prevSegment => {
      const updatedCriteria = { ...prevSegment.criteria };
      if (updatedCriteria[criteriaType].includes(value)) {
        updatedCriteria[criteriaType] = updatedCriteria[criteriaType].filter(item => item !== value);
      } else {
        updatedCriteria[criteriaType] = [...updatedCriteria[criteriaType], value];
      }
      return { ...prevSegment, criteria: updatedCriteria };
    });
  };

  const formatCriteria = (criteria: VoterSegment['criteria']) => {
    return (
      <VStack align="start" spacing={1}>
        {Object.entries(criteria).map(([key, values]) => (
          values.length > 0 && (
            <Text key={key}>
              <strong>{key === 'ageRange' ? 'Age Range' : key === 'voteLikelihood' ? 'Vote Likelihood' : key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {values.join(', ')}
            </Text>
          )
        ))}
      </VStack>
    );
  };

  const hasPlaceholderSegments = segments.some(s => s.isPlaceholder);

  return (
    <Box p={8}>
      <Heading mb={6}>Voter Segments</Heading>
      {hasPlaceholderSegments && (
        <Alert status="info" mb={4}>
          <AlertIcon />
          Set up your Base and Persuadable voter segments to help organize your campaign outreach.
        </Alert>
      )}
      <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={() => handleOpenModal()} mb={4}>
        Add New Segment
      </Button>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Description</Th>
            <Th>Criteria</Th>
            <Th>Voters in Segment</Th>
            <Th>Voters with Phone Numbers</Th>
            <Th>Voters with Addresses</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {segments.map((segment) => (
            <Tr key={segment.id} bg={segment.isPlaceholder ? "blue.50" : undefined}>
              <Td>{segment.name}</Td>
              <Td>{segment.description}</Td>
              <Td>{segment.id === 0 ? "All voters" : formatCriteria(segment.criteria)}</Td>
              <Td>{segment.votersInSegment}</Td>
              <Td>{segment.votersWithPhone}</Td>
              <Td>{segment.votersWithAddress}</Td>
              <Td>
                {segment.id !== 0 && (
                  <>
                    {segment.id === 1 || segment.id === 2 ? (
                      <Button
                        size="sm"
                        mr={2}
                        colorScheme="blue"
                        onClick={() => {
                          const votersInSegment = Math.floor(Math.random() * (2000 - 500 + 1)) + 500;
                          setCurrentSegment({
                            ...segment,
                            votersInSegment: segment.criteria !== currentSegment.criteria ? votersInSegment : segment.votersInSegment,
                            votersWithAddress: segment.criteria !== currentSegment.criteria ? Math.floor(votersInSegment * (Math.random() * (1 - 0.5) + 0.5)) : segment.votersWithAddress,
                            votersWithPhone: segment.criteria !== currentSegment.criteria ? Math.floor(votersInSegment * (Math.random() * (1 - 0.5) + 0.5)) : segment.votersWithPhone,
                            isPlaceholder: false
                          });
                          handleOpenModal(segment);
                        }}
                      >
                        {segment.isPlaceholder ? 
                          `Set your ${segment.name.toLowerCase()}` : 
                          `Edit your ${segment.name.toLowerCase()}`}
                      </Button>
                    ) : (
                      <>
                        <IconButton
                          aria-label="Edit segment"
                          icon={<EditIcon />}
                          size="sm"
                          mr={2}
                          onClick={() => handleOpenModal(segment)}
                        />
                        <IconButton
                          aria-label="Delete segment"
                          icon={<DeleteIcon />}
                          size="sm"
                          colorScheme="red"
                          onClick={() => handleDeleteSegment(segment.id)}
                        />
                      </>
                    )}
                  </>
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEditing ? 'Edit Segment' : 'Add New Segment'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isInvalid={!!nameError}>
              <FormLabel>Name</FormLabel>
              <Input
                value={currentSegment.name}
                onChange={(e) => {
                  setCurrentSegment({ ...currentSegment, name: e.target.value });
                  if (e.target.value.trim()) {
                    setNameError('');
                  }
                }}
              />
              <FormErrorMessage>{nameError}</FormErrorMessage>
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Description</FormLabel>
              <Input
                value={currentSegment.description}
                onChange={(e) => setCurrentSegment({ ...currentSegment, description: e.target.value })}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Audience</FormLabel>
              <VStack align="start">
                {['Super Voters (75%+)', 'Likely Voters (50%-75%)', 'Unreliable Voters (25%-50%)', 'Unlikely Voters (0%-25%)', 'First Time Voters'].map((audience) => (
                  <Checkbox
                    key={audience}
                    isChecked={currentSegment.criteria.voteLikelihood.includes(audience)}
                    onChange={() => handleCriteriaChange('voteLikelihood', audience)}
                  >
                    {audience}
                  </Checkbox>
                ))}
              </VStack>
            </FormControl>
            
            <FormControl mt={4}>
              <FormLabel>Political Party</FormLabel>
              <VStack align="start">
                {['Independent / Non-Partisan', 'Democrat', 'Republican'].map((party) => (
                  <Checkbox
                    key={party}
                    isChecked={currentSegment.criteria.party.includes(party)}
                    onChange={() => handleCriteriaChange('party', party)}
                  >
                    {party}
                  </Checkbox>
                ))}
              </VStack>
            </FormControl>
            
            <FormControl mt={4}>
              <FormLabel>Age</FormLabel>
              <VStack align="start">
                {['18-25', '25-35', '35-50', '50+'].map((range) => (
                  <Checkbox
                    key={range}
                    isChecked={currentSegment.criteria.ageRange.includes(range)}
                    onChange={() => handleCriteriaChange('ageRange', range)}
                  >
                    {range}
                  </Checkbox>
                ))}
              </VStack>
            </FormControl>
            
            <FormControl mt={4}>
              <FormLabel>Gender</FormLabel>
              <VStack align="start">
                {['Male', 'Female', 'Unknown'].map((gender) => (
                  <Checkbox
                    key={gender}
                    isChecked={currentSegment.criteria.gender.includes(gender)}
                    onChange={() => handleCriteriaChange('gender', gender)}
                  >
                    {gender}
                  </Checkbox>
                ))}
              </VStack>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSaveSegment}>
              Save
            </Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default VoterSegments;