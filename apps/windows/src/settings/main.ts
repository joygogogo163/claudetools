import { mount } from 'svelte';
import '../lib/theme.css';
import Settings from './Settings.svelte';

mount(Settings, { target: document.getElementById('app')! });
