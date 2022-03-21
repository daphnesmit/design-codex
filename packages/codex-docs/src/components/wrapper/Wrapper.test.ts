import { mount, config } from '@vue/test-utils';
import { ref } from 'vue';
import Wrapper from './Wrapper.vue';
import { ControlsConfig } from './../../types';
import { DirectionKey } from '../../constants';

const controlsConfig: ControlsConfig = [
	{ name: 'radioControl', type: 'radio', options: [ 'Option 1', 'Option 2', 'Option 3' ] },
	{
		name: 'radioWithStringDefault',
		type: 'radio',
		options: [ 'Option 1', 'Option 2', 'Option 3' ],
		default: 'Option 2'
	},
	{
		name: 'radioWithNumberDefault',
		type: 'radio',
		options: [ 1, 2, 3 ],
		default: 2
	},
	{ name: 'booleanControl', type: 'boolean' },
	{ name: 'booleanWithDefault', type: 'boolean', default: false },
	{ name: 'textControl', type: 'text' },
	{ name: 'textWithStringDefault', type: 'text', default: 'Default value' },
	{ name: 'textWithNumberDefault', type: 'text', default: 42 },
	{ name: 'slotControl', type: 'slot', default: 'Hello world' }
];

const ltrRef = ref( 'ltr' );

config.global.provide = {
	[ DirectionKey as symbol ]: ltrRef
};

const CodeCopySelector = '.cdx-demo-wrapper__demo-pane__code-copy';
const CodeToggleSelector = '.cdx-demo-wrapper__demo-pane__code-toggle';
const ResetButtonSelector = '.cdx-demo-wrapper__demo-pane__reset-button';

it( 'includes code sample when code is provided', () => {
	const wrapper = mount( Wrapper, {
		slots: {
			code: '<p>Hello world</p>'
		}
	} );
	expect( wrapper.vm.hasCodeSample ).toBeTruthy();
} );

it( 'omits code sample when code is not provided', () => {
	const wrapper = mount( Wrapper );
	expect( wrapper.vm.hasCodeSample ).toBeFalsy();
} );

it( 'shows and hides code on button click', async () => {
	const wrapper = mount( Wrapper, {
		slots: {
			code: '<p>Hello world</p>'
		}
	} );

	await wrapper.get( CodeToggleSelector ).trigger( 'click' );
	expect( wrapper.vm.showCode ).toBeTruthy();
	expect( wrapper.vm.codeToggleLabel ).toBe( 'Hide code' );

	await wrapper.get( CodeToggleSelector ).trigger( 'click' );
	expect( wrapper.vm.showCode ).toBeFalsy();
	expect( wrapper.vm.codeToggleLabel ).toBe( 'Show code' );
} );

it( 'allows code to be copied', async () => {
	const wrapper = mount( Wrapper, {
		slots: {
			code: '<p>Hello world</p>'
		}
	} );

	// copy not visible until code is shown
	expect( wrapper.get( CodeCopySelector ).isVisible() ).toBe( false );

	await wrapper.get( CodeToggleSelector ).trigger( 'click' );
	expect( wrapper.vm.showCode ).toBeTruthy();

	// copy is visible when code is shown
	expect( wrapper.get( CodeCopySelector ).isVisible() ).toBe( true );

	// Actual functionality of the copy button is tested for that component elsewhere

	// hide code and copy again
	await wrapper.get( CodeToggleSelector ).trigger( 'click' );
	expect( wrapper.vm.showCode ).toBeFalsy();
	expect( wrapper.get( CodeCopySelector ).isVisible() ).toBe( false );
} );

it( 'includes controls if config is provided', () => {
	const wrapper = mount( Wrapper, { props: { controlsConfig } } );
	expect( wrapper.vm.hasControls ).toBeTruthy();
} );

it( 'omits controls if no config is provided', () => {
	const wrapper = mount( Wrapper );
	expect( wrapper.vm.hasControls ).toBeFalsy();
} );

it( 'sets default values appropriately', () => {
	const wrapper = mount( Wrapper, { props: { controlsConfig } } );
	const expectedProps = {
		radioControl: 'Option 1',
		radioWithStringDefault: 'Option 2',
		radioWithNumberDefault: 2,
		booleanControl: false,
		booleanWithDefault: false,
		textControl: '',
		textWithStringDefault: 'Default value',
		textWithNumberDefault: 42
	};
	const expectedSlots = {
		slotControl: 'Hello world'
	};
	expect( wrapper.vm.propValues ).toMatchObject( expectedProps );
	expect( wrapper.vm.slotValues ).toMatchObject( expectedSlots );
} );

it( 'reacts to prop updates from the Controls component', async () => {
	const wrapper = mount( Wrapper, { props: { controlsConfig } } );
	expect( wrapper.vm.propValues.radioControl ).toBe( 'Option 1' );

	const radio3 = wrapper.find( 'input[name="radio-group-radioControl"][value="Option 3"]' );
	( radio3.element as HTMLInputElement ).checked = true;
	await radio3.trigger( 'change' );

	expect( wrapper.vm.propValues.radioControl ).toBe( 'Option 3' );
} );

it( 'can be reset', async () => {
	// A bit of duplication from the props update above unfortunately
	const wrapper = mount( Wrapper, { props: { controlsConfig } } );
	expect( wrapper.vm.propValues.radioControl ).toBe( 'Option 1' );

	const radio3 = wrapper.find( 'input[name="radio-group-radioControl"][value="Option 3"]' );
	( radio3.element as HTMLInputElement ).checked = true;
	await radio3.trigger( 'change' );

	expect( wrapper.vm.propValues.radioControl ).toBe( 'Option 3' );

	await wrapper.get( ResetButtonSelector ).trigger( 'click' );
	expect( wrapper.vm.propValues.radioControl ).toBe( 'Option 1' );
} );
