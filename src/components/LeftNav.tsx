import React from 'react';
import { Box, VStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const LeftNav = () => {
  return (
    <Box width="200px" bg="gray.100" p={4} minHeight="calc(100vh - 68px)">
      <VStack spacing={4} align="stretch">
        <Link to="/voter-segments">Voter Segments</Link>
        <Link to="/outreach-campaigns">Outreach Campaigns</Link>
      </VStack>
    </Box>
  );
};

export default LeftNav;