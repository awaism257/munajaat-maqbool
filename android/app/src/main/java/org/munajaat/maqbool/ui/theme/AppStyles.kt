package org.munajaat.maqbool.ui.theme

import androidx.compose.material3.CardColors
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable

/**
 * Shared card style for the whole app: the same container colour as the
 * supplication boxes in the reader. Use for menu buttons, settings rows,
 * about/credits content, and any future pages so they all match.
 */
@Composable
fun appCardColors(): CardColors = CardDefaults.cardColors(
    containerColor = MaterialTheme.colorScheme.surfaceVariant
)
