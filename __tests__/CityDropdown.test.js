/* eslint-env jest */
import React from 'react';
import { Modal, Pressable, Text } from 'react-native';
import Renderer, { act } from 'react-test-renderer';
import CityDropdown from '../src/components/CityDropdown';

jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 24, bottom: 16 }) }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key, options) => options?.defaultValue || key }) }));

let tree;
afterEach(() => { if (tree) { act(() => tree.unmount()); } });
const press = id => act(() => tree.root.findByProps({ testID: id }).props.onPress());
const pressables = () => tree.root.findAllByType(Pressable.type || Pressable);
const choices = () => pressables().filter(node => node.props.accessibilityRole === 'radio');

test('searches mixed API city records and submits the exact selected value', () => {
    const onChange = jest.fn();
    act(() => {
        tree = Renderer.create(<CityDropdown districts={['Indore', { name: 'Jaipur' }, { city: 'NAGDA' }, null, 'Indore']}
            value="Jaipur" onChange={onChange} />);
    });
    press('city-dropdown');
    expect(choices()).toHaveLength(3);
    expect(choices().filter(node => node.props.accessibilityState.checked)).toHaveLength(1);
    act(() => tree.root.findByProps({ testID: 'city-search' }).props.onChangeText('  nag  '));
    expect(choices()).toHaveLength(1);
    act(() => choices()[0].props.onPress());
    expect(onChange).toHaveBeenCalledWith('NAGDA');
    expect(tree.root.findByType(Modal).props.visible).toBe(false);
    press('city-dropdown');
    expect(choices()).toHaveLength(3);
});

test('backdrop, close button and Android back cancel without changing selection', () => {
    const onChange = jest.fn();
    act(() => { tree = Renderer.create(<CityDropdown districts={['Indore']} value="" onChange={onChange} />); });
    for (const id of ['city-backdrop', 'city-close']) {
        press('city-dropdown');
        press(id);
        expect(tree.root.findByType(Modal).props.visible).toBe(false);
    }
    press('city-dropdown');
    act(() => tree.root.findByType(Modal).props.onRequestClose());
    expect(tree.root.findByType(Modal).props.visible).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
});

test('preserves an existing property city absent from the latest API list', () => {
    act(() => { tree = Renderer.create(<CityDropdown districts={[]} value="Old City" onChange={jest.fn()} />); });
    press('city-dropdown');
    expect(choices()).toHaveLength(1);
    expect(choices()[0].props.accessibilityState.checked).toBe(true);
    act(() => tree.root.findByProps({ testID: 'city-search' }).props.onChangeText('missing'));
    expect(choices()).toHaveLength(0);
    expect(tree.root.findAllByType(Text).some(node => node.props.children === 'No matching cities. Try another spelling.')).toBe(true);
});

test('failed city loading offers a retry', () => {
    const onRetry = jest.fn();
    act(() => { tree = Renderer.create(<CityDropdown districts={[]} value="" error onRetry={onRetry} onChange={jest.fn()} />); });
    press('city-dropdown');
    act(() => pressables().find(node => node.props.onPress === onRetry).props.onPress());
    expect(onRetry).toHaveBeenCalledTimes(1);
});
