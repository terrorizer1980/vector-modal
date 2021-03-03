import React, { FC, useState, useEffect } from 'react';
import CSS from 'csstype';
import {
  Box,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { Loader } from '../static';
import { CopyIcon, CheckCircleIcon } from '@chakra-ui/icons';
import {
  Header,
  Footer,
  NetworkBar,
  ModalContent,
  ModalBody,
  Text,
  Stack,
} from '../static';
import { CHAIN_DETAIL } from '../../constants';
import { darkGraphic } from '../../public';
// @ts-ignore
import QRCode from 'qrcode.react';

interface SwapListenerProps {
  showTimer: Boolean;
  options: () => void;
  handleBack: () => void;
  senderChannelAddress: string;
  senderChainInfo: CHAIN_DETAIL;
  receiverChainInfo: CHAIN_DETAIL;
  receiverAddress: string;
}

const styleModalContent: CSS.Properties = {
  backgroundImage: `url(${darkGraphic})`,
  backgroundColor: '#F5F5F5',
  border: '2px solid #4D4D4D',
  boxSizing: 'border-box',
  borderRadius: '15px',
  padding: '0.5rem',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right top',
};

const SwapListener: FC<SwapListenerProps> = props => {
  const {
    showTimer,
    senderChannelAddress,
    senderChainInfo,
    receiverChainInfo,
    receiverAddress,
    options,
    handleBack,
  } = props;
  const [copiedAddress, setCopiedAddress] = useState<boolean>(false);
  const [running, setRunning] = useState<Boolean>(false);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [currentTimeMin, setCurrentTimeMin] = useState<number>(0);
  const [watchInterval, setWatchInterval] = useState<NodeJS.Timeout>();

  const formatTime = (val: number) => {
    let value = val.toString();
    if (value.length < 2) {
      value = '0' + value;
    }

    return value;
  };

  function reset() {
    setCurrentTimeSec(0);
    setCurrentTimeMin(0);
  }

  function handleStart() {
    if (!running) {
      setRunning(true);
      let watch = setInterval(() => {
        setCurrentTimeSec(prevSec => {
          if (prevSec >= 60) {
            setCurrentTimeMin(prevMin => prevMin + 1);
            return 0;
          }
          return prevSec + 1;
        });
      }, 1000);
      setWatchInterval(watch);
    }
  }

  function handleStop() {
    setRunning(false);
    clearInterval(watchInterval!);
  }

  useEffect(() => {
    if (showTimer) {
      handleStart();
    } else {
      handleStop();
      reset();
    }
  }, [showTimer]);

  return (
    <>
      <ModalContent id="modalContent" style={styleModalContent}>
        <Header
          title="Ready for transfer"
          handleBack={handleBack}
          options={options}
        />
        <ModalBody>
          <Stack column={true} spacing={5}>
            <Stack column={true} spacing={3}>
              <Box>
                <Stack spacing={8}>
                  <Stack column={true} spacing={4}>
                    <Text fontSize="1rem" fontWeight="500">
                      Send{' '}
                      <span style={{ color: '#2964C5' }}>
                        {senderChainInfo.assetName}
                      </span>{' '}
                      on{' '}
                      <span style={{ color: '#2964C5' }}>
                        {senderChainInfo.name}
                      </span>{' '}
                      to the QR or address below.
                    </Text>
                    <Stack column={true} spacing={3}>
                      <Text fontSize="1rem">Awaiting your transfer...</Text>
                      <Stack spacing={4} alignItems="center">
                        <Loader color="blue" />
                        <Text fontFamily="Roboto Mono">
                          {formatTime(currentTimeMin)}:
                          {formatTime(currentTimeSec)}
                        </Text>
                      </Stack>
                    </Stack>
                  </Stack>
                  <Box bg="white" borderRadius="15px">
                    <QRCode
                      value={senderChannelAddress}
                      size={150}
                      style={{ padding: '0.5rem' }}
                    />
                  </Box>
                </Stack>
              </Box>

              <InputGroup
                size="lg"
                bg="#DEDEDE"
                alignItems="center"
                borderRadius="15px"
                fontFamily="Roboto Mono"
              >
                <Input
                  id="depositAddress"
                  name="address"
                  value={senderChannelAddress}
                  inputMode="search"
                  title="Deposit Address"
                  // styling
                  border="none"
                  fontSize="14px"
                  flex="auto"
                  // misc
                  isReadOnly={true}
                />
                <InputRightElement
                  children={
                    <IconButton
                      aria-label="Clipboard"
                      onClick={() => {
                        console.log(`Copying: ${senderChannelAddress}`);
                        navigator.clipboard.writeText(senderChannelAddress);
                        setCopiedAddress(true);
                        setTimeout(() => setCopiedAddress(false), 5000);
                      }}
                      icon={!copiedAddress ? <CopyIcon /> : <CheckCircleIcon />}
                      // style
                      size="sm"
                      fontSize="20px"
                      border="none"
                      background="transparent"
                    />
                  }
                />
              </InputGroup>
            </Stack>

            <NetworkBar
              senderChainInfo={senderChainInfo}
              receiverChainInfo={receiverChainInfo}
              receiverAddress={receiverAddress}
            />
          </Stack>
        </ModalBody>

        <Footer />
      </ModalContent>
    </>
  );
};

export default SwapListener;
