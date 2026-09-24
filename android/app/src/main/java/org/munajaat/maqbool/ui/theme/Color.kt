package org.munajaat.maqbool.ui.theme

import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.ui.graphics.Color

private val Green = Color(0xFF1B5E20)
private val GreenLight = Color(0xFF4C8C4A)
private val Gold = Color(0xFFB28704)

val LightColors = lightColorScheme(
    primary = Green,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFA8D5A2),
    onPrimaryContainer = Color(0xFF002204),
    secondary = Gold,
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFF5E7C1),
    onSecondaryContainer = Color(0xFF261A00),
    tertiary = GreenLight,
    background = Color(0xFFFBFDF7),
    surface = Color(0xFFFBFDF7)
)

val DarkColors = darkColorScheme(
    primary = Color(0xFF8ECB87),
    onPrimary = Color(0xFF00390A),
    primaryContainer = Color(0xFF075116),
    onPrimaryContainer = Color(0xFFA8E8A0),
    secondary = Color(0xFFE4C465),
    onSecondary = Color(0xFF3E2E00),
    secondaryContainer = Color(0xFF594400),
    onSecondaryContainer = Color(0xFFF5E7C1)
)
