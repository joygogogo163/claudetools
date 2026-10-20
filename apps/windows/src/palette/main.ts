import { mount } from 'svelte';
import '../lib/theme.css';
import Palette from './Palette.svelte';

mount(Palette, { target: document.getElementById('app')! });
