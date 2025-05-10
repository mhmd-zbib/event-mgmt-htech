import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ThemeService {
  final SharedPreferences _prefs;
  static const String _themeKey = 'theme_mode';
  
  ThemeService(this._prefs);
  
  // Get current theme mode
  ThemeMode getThemeMode() {
    final themeString = _prefs.getString(_themeKey);
    if (themeString == null) {
      return ThemeMode.system;
    }
    
    return ThemeMode.values.firstWhere(
      (e) => e.toString() == themeString,
      orElse: () => ThemeMode.system,
    );
  }
  
  // Set theme mode
  Future<bool> setThemeMode(ThemeMode mode) async {
    return await _prefs.setString(_themeKey, mode.toString());
  }
  
  // Toggle between light and dark theme
  Future<ThemeMode> toggleTheme() async {
    final currentMode = getThemeMode();
    late ThemeMode newMode;
    
    if (currentMode == ThemeMode.dark) {
      newMode = ThemeMode.light;
    } else {
      newMode = ThemeMode.dark;
    }
    
    await setThemeMode(newMode);
    return newMode;
  }
}
