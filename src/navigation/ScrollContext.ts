import { createContext, useContext } from 'react';
import { Animated } from 'react-native';

/** Ana kaydırma alanının dikey konumu (MainShell sağlar). Ekranlar bununla bir bölümü üstte "sabitleyebilir". */
export const ScrollYContext = createContext<Animated.Value | null>(null);
export const useScrollY = () => useContext(ScrollYContext);
