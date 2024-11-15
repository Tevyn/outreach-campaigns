import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  Select,
  Text,
  VStack,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Link,
  IconButton,
  Input,
  HStack,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  useDisclosure,
  Grid,
  GridItem,
  Flex,
  VStack as ChakraVStack,
  Progress
} from '@chakra-ui/react';
import { useVoterSegments } from './VoterSegments';
import { Link as RouterLink } from 'react-router-dom';
import { EditIcon, CheckIcon } from '@chakra-ui/icons';

interface Todo {
  id: number;
  title: string;
  dueDate: string;
  completed: boolean;
  description: string;
}

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

const Dashboard = () => {
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const { segments } = useVoterSegments();
  const [touchGoals, setTouchGoals] = useState<{[key: number]: number}>({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingGoals, setEditingGoals] = useState<{[key: number]: number}>({});
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isEditTodoOpen, setIsEditTodoOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  
  useEffect(() => {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
      setTodos(JSON.parse(storedTodos));
    } else {
      const defaultTodos: Todo[] = [
        { 
          id: 1, 
          title: 'Voter segmentation', 
          dueDate: '2024-01-15', 
          completed: false,
          description: 'Set up your voter segments to strategically target different voter groups and maximize campaign impact.'
        },
        { 
          id: 2, 
          title: 'Platform', 
          dueDate: '2024-01-31', 
          completed: false,
          description: 'Define your campaign\'s core message and values to connect with voters effectively.'
        },
        { 
          id: 3, 
          title: 'Policy positions', 
          dueDate: '2024-02-15', 
          completed: false,
          description: 'Develop clear stances on key issues to help voters understand where you stand.'
        },
      ];
      setTodos(defaultTodos);
      localStorage.setItem('todos', JSON.stringify(defaultTodos));
    }
  }, []);

  // Get campaigns from localStorage
  const getCampaigns = () => {
    const storedCampaigns = localStorage.getItem('campaigns');
    return storedCampaigns ? JSON.parse(storedCampaigns) : [];
  };

  // Load touch goals from localStorage on mount
  useEffect(() => {
    const storedGoals = localStorage.getItem('touchGoals');
    if (storedGoals) {
      setTouchGoals(JSON.parse(storedGoals));
    } else {
      // Set default goal of 5 for all segments
      const defaultGoals = segments.reduce((acc, segment) => ({
        ...acc,
        [segment.id]: 5
      }), {});
      setTouchGoals(defaultGoals);
      localStorage.setItem('touchGoals', JSON.stringify(defaultGoals));
    }
  }, [segments]);

  const handleTodoToggle = (id: number) => {
    const updatedTodos = todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);
    localStorage.setItem('todos', JSON.stringify(updatedTodos));
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setIsEditTodoOpen(true);
  };

  const handleSaveTodo = () => {
    if (editingTodo) {
      const updatedTodos = todos.map(todo =>
        todo.id === editingTodo.id ? editingTodo : todo
      );
      setTodos(updatedTodos);
      localStorage.setItem('todos', JSON.stringify(updatedTodos));
      setIsEditTodoOpen(false);
      setEditingTodo(null);
    }
  };

  const handleDeleteTodo = () => {
    if (editingTodo) {
      const updatedTodos = todos.filter(todo => todo.id !== editingTodo.id);
      setTodos(updatedTodos);
      localStorage.setItem('todos', JSON.stringify(updatedTodos));
      setIsEditTodoOpen(false);
      setEditingTodo(null);
    }
  };

  // Calculate total actuals by segment
  const getSegmentActuals = () => {
    const campaigns = getCampaigns();
    const segmentTotals: { [key: number]: number } = {};

    campaigns.forEach((campaign: any) => {
      const segmentId = campaign.voterSegmentId;
      const totalActuals = Object.values(campaign.actualContacts).reduce((sum: number, current: any) => sum + current, 0);
      
      segmentTotals[segmentId] = (segmentTotals[segmentId] || 0) + totalActuals;
    });

    return segmentTotals;
  };

  // Get campaigns scheduled for selected week
  const getWeekCampaigns = () => {
    const campaigns = getCampaigns();
    return campaigns.filter((campaign: Campaign) => 
      campaign.weeks.includes(selectedWeek)
    );
  };

  const hasUnsetRequiredSegments = () => {
    return segments.some(s => (s.id === 1 || s.id === 2) && s.isPlaceholder);
  };

  const handleOpenGoalsModal = () => {
    setEditingGoals({...touchGoals});
    onOpen();
  };

  const handleSaveGoals = () => {
    setTouchGoals(editingGoals);
    localStorage.setItem('touchGoals', JSON.stringify(editingGoals));
    onClose();
  };

  const getOutreachProgress = (campaign: Campaign, currentWeek: number) => {
    const startWeek = Math.min(...campaign.weeks);
    const endWeek = Math.max(...campaign.weeks);
    const totalWeeks = endWeek - startWeek + 1;
    const currentOutreachWeek = currentWeek - startWeek + 1;
    return `Week ${currentOutreachWeek} of ${totalWeeks}`;
  };

  const segmentActuals = getSegmentActuals();
  const weekCampaigns = getWeekCampaigns();

  return (
    <Box p={8}>
      <Heading mb={6}>Dashboard</Heading>

      <Grid templateColumns="1fr 2fr" gap={8}>
        {/* To do this week Section */}
        <GridItem>
          <Box>
            <Heading size="md" mb={4}>To do this week</Heading>

            <VStack align="stretch" spacing={4}>
              {todos.map(todo => (
                <Box 
                  key={todo.id}
                  p={4}
                  borderWidth={1}
                  borderRadius="md"
                  backgroundColor="blue.50"
                  opacity={todo.completed ? 0.7 : 1}
                >
                  <Flex justify="space-between" align="start">
                    <Box mr={4}>
                      <Text fontWeight="bold">{todo.title}</Text>
                      <Text fontSize="sm" color="gray.600">
                        {todo.title === 'Voter segmentation' && (
                          <Link as={RouterLink} to="/voter-segments" color="blue.500">
                            {todo.description}
                          </Link>
                        )}
                        {todo.title !== 'Voter segmentation' && todo.description}
                      </Text>
                      <Text fontSize="sm" color="gray.600" mt={2}>
                        Due: {new Date(todo.dueDate).toLocaleDateString()}
                      </Text>
                    </Box>
                    <ChakraVStack spacing={2} align="flex-end" ml={4}>
                      <IconButton
                        aria-label="Edit todo"
                        icon={<EditIcon />}
                        size="sm"
                        onClick={() => handleEditTodo(todo)}
                      />
                      <Button
                        size="sm"
                        colorScheme={todo.completed ? "gray" : "green"}
                        leftIcon={<CheckIcon />}
                        onClick={() => handleTodoToggle(todo.id)}
                      >
                        {todo.completed ? "Done" : "Mark Done"}
                      </Button>
                    </ChakraVStack>
                  </Flex>
                </Box>
              ))}

              {weekCampaigns.map((campaign: Campaign) => (
                <Box 
                  key={campaign.id}
                  p={4}
                  borderWidth={1}
                  borderRadius="md"
                  bg="white"
                >
                  <Flex justify="space-between" align="center" mb={2}>
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold">{campaign.name}</Text>
                      <Text fontSize="sm" color="gray.600">{campaign.channel}</Text>
                    </VStack>
                  </Flex>

                  <Text fontSize="sm" mb={2}>
                    {getOutreachProgress(campaign, selectedWeek)}
                  </Text>

                  <Progress 
                    value={(campaign.actualContacts[selectedWeek] || 0) / (segments.find(s => s.id === campaign.voterSegmentId)?.votersInSegment || 1) * 100} 
                    size="sm" 
                    mb={2}
                  />

                  <Flex justify="space-between" align="center">
                    <Text fontSize="sm">
                      {campaign.actualContacts[selectedWeek]?.toLocaleString() || 0} of {segments.find(s => s.id === campaign.voterSegmentId)?.votersInSegment?.toLocaleString() || 0} contacts
                    </Text>
                  </Flex>
                </Box>
              ))}
            </VStack>

            <Select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              maxWidth="200px"
              mt={4}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(week => (
                <option key={week} value={week}>Week {week}</option>
              ))}
            </Select>
          </Box>
        </GridItem>

        {/* Touches per voter segment Section */}
        <GridItem>
          <Box>
            <HStack mb={4} justify="space-between">
              <Heading size="md">Touches per voter segment</Heading>
              <Button 
                leftIcon={<EditIcon />}
                size="sm"
                onClick={handleOpenGoalsModal}
              >
                Edit goals
              </Button>
            </HStack>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {segments.map(segment => {
                const touchesPerVoter = segment.votersInSegment 
                  ? ((segmentActuals[segment.id] || 0) / segment.votersInSegment)
                  : 0;
                const goal = touchGoals[segment.id] || 5;
                  
                return (
                  <Card key={segment.id}>
                    <CardHeader>
                      <Heading size="sm">{segment.name}</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack align="stretch" spacing={3}>
                        <HStack mb={2}>
                          <Text fontSize="2xl" fontWeight="bold">
                            {touchesPerVoter === 0 ? '0' : touchesPerVoter.toFixed(1)}/{goal}
                          </Text>
                          <Text fontSize="md" color="gray.600">touches per voter</Text>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                          On average you've contacted each voter in this segment {touchesPerVoter === 0 ? 0 : touchesPerVoter.toFixed(1)} times out of a goal of {goal}.
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                );
              })}
            </SimpleGrid>
          </Box>
        </GridItem>
      </Grid>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Touch Goals</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              {segments.map(segment => (
                <FormControl key={segment.id}>
                  <FormLabel>{segment.name}</FormLabel>
                  <Input
                    type="number"
                    value={editingGoals[segment.id] || 5}
                    onChange={(e) => setEditingGoals({
                      ...editingGoals,
                      [segment.id]: Number(e.target.value)
                    })}
                  />
                </FormControl>
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSaveGoals}>
              Save
            </Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isEditTodoOpen} onClose={() => setIsEditTodoOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Todo</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Title</FormLabel>
                <Input
                  value={editingTodo?.title || ''}
                  onChange={(e) => setEditingTodo(prev => prev ? {...prev, title: e.target.value} : null)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Due Date</FormLabel>
                <Input
                  type="date"
                  value={editingTodo?.dueDate || ''}
                  onChange={(e) => setEditingTodo(prev => prev ? {...prev, dueDate: e.target.value} : null)}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr="auto" onClick={handleDeleteTodo}>
              Delete
            </Button>
            <Button colorScheme="blue" mr={3} onClick={handleSaveTodo}>
              Save
            </Button>
            <Button variant="ghost" onClick={() => setIsEditTodoOpen(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Dashboard;