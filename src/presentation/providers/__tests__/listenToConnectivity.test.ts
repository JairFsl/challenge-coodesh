import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';

import { listenToConnectivity } from '../QueryProvider';

function netState(isConnected: boolean) {
  return { isConnected } as NetInfoState;
}

describe('listenToConnectivity', () => {
  let emit: (state: NetInfoState) => void;
  let resolveFetch: (state: NetInfoState) => void;

  beforeEach(() => {
    jest.spyOn(NetInfo, 'addEventListener').mockImplementation(listener => {
      emit = listener as (state: NetInfoState) => void;
      return jest.fn();
    });
    jest
      .spyOn(NetInfo, 'fetch')
      .mockImplementation(() => new Promise(resolve => (resolveFetch = resolve)));
  });

  afterEach(() => jest.restoreAllMocks());

  it('uses the initial fetch when no change event arrived yet', async () => {
    const setOnline = jest.fn();
    listenToConnectivity(setOnline);

    resolveFetch(netState(false));
    await Promise.resolve();

    expect(setOnline).toHaveBeenLastCalledWith(false);
  });

  it('ignores a stale fetch resolved after a newer change event', async () => {
    const setOnline = jest.fn();
    listenToConnectivity(setOnline);

    emit(netState(false));
    resolveFetch(netState(true));
    await Promise.resolve();

    expect(setOnline).toHaveBeenCalledTimes(1);
    expect(setOnline).toHaveBeenLastCalledWith(false);
  });

  it('follows every connectivity change', () => {
    const setOnline = jest.fn();
    listenToConnectivity(setOnline);

    emit(netState(false));
    emit(netState(true));

    expect(setOnline.mock.calls).toEqual([[false], [true]]);
  });
});
