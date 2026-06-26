import { UCID } from '../../types';
import { mockUcidsComputeStorage } from './ucidsComputeStorage';
import { mockUcidsNetworkingSecurity } from './ucidsNetworkingSecurity';

export const UCIDS: UCID[] = [...mockUcidsComputeStorage, ...mockUcidsNetworkingSecurity];
