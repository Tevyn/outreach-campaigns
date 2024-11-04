import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import LeftNav from './components/LeftNav';
import OutreachCampaigns from './components/OutreachCampaigns';
import VoterSegments from './components/VoterSegments';
import { VoterSegmentProvider } from './components/VoterSegments';
import { ChakraProvider } from '@chakra-ui/react';

function App() {
  return (
    <VoterSegmentProvider>
      <Box>
        <Header />
        <Flex>
          <LeftNav />
          <Box flex={1}>
            <Routes>
              <Route path="/voter-segments" element={<VoterSegments />} />
              <Route path="/outreach-campaigns" element={<OutreachCampaigns />} />
              <Route path="/" element={<OutreachCampaigns />} />
            </Routes>
          </Box>
        </Flex>
      </Box>
    </VoterSegmentProvider>
  );
}

export default App;
