import React, { useState } from 'react';
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
  Alert,
  AlertIcon,
  Link
} from '@chakra-ui/react';
import { useVoterSegments } from './VoterSegments';
import { Link as RouterLink } from 'react-router-dom';

const Dashboard = () => {
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const { segments } = useVoterSegments();
  
  // Get campaigns from localStorage
  const getCampaigns = () => {
    const storedCampaigns = localStorage.getItem('campaigns');
    return storedCampaigns ? JSON.parse(storedCampaigns) : [];
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
    return campaigns.filter((campaign: any) => 
      campaign.weeks.includes(selectedWeek)
    );
  };

  const hasUnsetRequiredSegments = () => {
    return segments.some(s => (s.id === 1 || s.id === 2) && s.isPlaceholder);
  };

  const segmentActuals = getSegmentActuals();
  const weekCampaigns = getWeekCampaigns();

  return (
    <Box p={8}>
      <Heading mb={6}>Dashboard</Heading>

      {/* Segment Touches Summary */}
      <Box mb={8}>
        <Heading size="md" mb={4}>Touches per voter</Heading>
        {hasUnsetRequiredSegments() && (
          <Alert status="info" mb={4}>
            <AlertIcon />
            <Box>
              <Text>
                <Link as={RouterLink} to="/voter-segments" color="blue.500">Set your voter segments</Link> to better target your outreach.
              </Text>
            </Box>
          </Alert>
        )}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {segments.map(segment => {
            const touchesPerVoter = segment.votersInSegment 
              ? ((segmentActuals[segment.id] || 0) / segment.votersInSegment).toFixed(1)
              : '0';
              
            return (
              <Card key={segment.id}>
                <CardHeader>
                  <Heading size="sm">{segment.name}</Heading>
                </CardHeader>
                <CardBody>
                  <Text fontSize="2xl" fontWeight="bold">{touchesPerVoter}</Text>
                  <Text fontSize="sm" color="gray.600">touches per voter</Text>
                </CardBody>
              </Card>
            );
          })}
        </SimpleGrid>
      </Box>

      {/* This Week Section */}
      <Box>
        <Heading size="md" mb={4}>This Week</Heading>
        <Select
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(Number(e.target.value))}
          maxWidth="200px"
          mb={4}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map(week => (
            <option key={week} value={week}>Week {week}</option>
          ))}
        </Select>

        {weekCampaigns.length > 0 ? (
          <VStack align="stretch" spacing={4}>
            {weekCampaigns.map((campaign: any) => (
              <Box 
                key={campaign.id} 
                p={4} 
                borderWidth={1} 
                borderRadius="md"
                backgroundColor="blue.50"
              >
                <Text fontWeight="bold">{campaign.name}</Text>
                <Text>Channel: {campaign.channel}</Text>
                <Text>
                  Segment: {segments.find(s => s.id === campaign.voterSegmentId)?.name}
                </Text>
                <Text>
                  Contacts this week: {campaign.actualContacts[selectedWeek]?.toLocaleString() || 0}
                </Text>
              </Box>
            ))}
          </VStack>
        ) : (
          <Text>No outreach scheduled for Week {selectedWeek}</Text>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;