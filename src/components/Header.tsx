import React from 'react';
import { Box, Heading } from '@chakra-ui/react';

const Header = () => {
  return (
    <Box bg="blue.500" color="white" p={4}>
      <Heading size="lg">Campaign Tools</Heading>
    </Box>
  );
};

export default Header;