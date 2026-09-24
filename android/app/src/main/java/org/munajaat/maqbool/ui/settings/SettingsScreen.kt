package org.munajaat.maqbool.ui.settings

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Slider
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import kotlin.math.roundToInt
import org.munajaat.maqbool.AppViewModel
import org.munajaat.maqbool.data.ThemePreference
import org.munajaat.maqbool.ui.theme.appCardColors

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    viewModel: AppViewModel,
    onBack: () -> Unit,
    onOpenCredits: () -> Unit
) {
    val prefs by viewModel.prefs.collectAsState()

    Scaffold(
        containerColor = Color.Transparent,
        topBar = {
            TopAppBar(
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.Transparent),
                title = { Text("Settings", maxLines = 1, overflow = TextOverflow.Ellipsis) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            Card(colors = appCardColors(), modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(16.dp)) {
            Text("Display", style = MaterialTheme.typography.titleMedium)

            PercentSlider(
                label = "Arabic font size",
                value = prefs.arabicFontScale,
                onValueChange = { viewModel.setArabicFontScale(it) },
                modifier = Modifier.padding(top = 16.dp)
            )
            PercentSlider(
                label = "Arabic line spacing",
                value = prefs.arabicLineSpacing,
                onValueChange = { viewModel.setArabicLineSpacing(it) },
                modifier = Modifier.padding(top = 8.dp)
            )
            PercentSlider(
                label = "English font size",
                value = prefs.englishFontScale,
                onValueChange = { viewModel.setEnglishFontScale(it) },
                modifier = Modifier.padding(top = 8.dp)
            )
            PercentSlider(
                label = "Urdu font size",
                value = prefs.urduFontScale,
                onValueChange = { viewModel.setUrduFontScale(it) },
                modifier = Modifier.padding(top = 8.dp)
            )
            PercentSlider(
                label = "Transliteration font size",
                value = prefs.transliterationFontScale,
                onValueChange = { viewModel.setTransliterationFontScale(it) },
                modifier = Modifier.padding(top = 8.dp)
            )

            Row(
                modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    "Show English translation",
                    style = MaterialTheme.typography.bodyLarge,
                    modifier = Modifier.weight(1f)
                )
                Switch(
                    checked = prefs.showEnglish,
                    onCheckedChange = { viewModel.setShowEnglish(it) }
                )
            }

            Row(
                modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    "Show Urdu translation",
                    style = MaterialTheme.typography.bodyLarge,
                    modifier = Modifier.weight(1f)
                )
                Switch(
                    checked = prefs.showUrdu,
                    onCheckedChange = { viewModel.setShowUrdu(it) }
                )
            }

            Row(
                modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    "Show transliteration",
                    style = MaterialTheme.typography.bodyLarge,
                    modifier = Modifier.weight(1f)
                )
                Switch(
                    checked = prefs.showTransliteration,
                    onCheckedChange = { viewModel.setShowTransliteration(it) }
                )
            }

            }
            }

            Card(colors = appCardColors(), modifier = Modifier.fillMaxWidth().padding(top = 16.dp)) {
            Column(modifier = Modifier.padding(16.dp)) {
            Text("Theme", style = MaterialTheme.typography.titleMedium)
            Column(Modifier.selectableGroup()) {
                listOf(
                    ThemePreference.SYSTEM to "System default",
                    ThemePreference.LIGHT to "Light",
                    ThemePreference.DARK to "Dark"
                ).forEach { (value, label) ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .selectable(
                                selected = prefs.theme == value,
                                onClick = { viewModel.setTheme(value) },
                                role = Role.RadioButton
                            )
                            .padding(vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(selected = prefs.theme == value, onClick = null)
                        Text(
                            label,
                            style = MaterialTheme.typography.bodyLarge,
                            modifier = Modifier.padding(start = 12.dp)
                        )
                    }
                }
            }

            }
            }

            Card(
                colors = appCardColors(),
                modifier = Modifier.fillMaxWidth().padding(top = 16.dp)
            ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable(onClick = onOpenCredits)
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    "About",
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.weight(1f)
                )
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                    contentDescription = "Open credits",
                    tint = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            }
        }
    }
}

private const val SLIDER_MIN = 0.8f
private const val SLIDER_MAX = 1.6f

/**
 * JustQuran-style slider row: label on the left with a live percentage on the
 * right, and the slider full width below it.
 */
@Composable
private fun PercentSlider(
    label: String,
    value: Float,
    onValueChange: (Float) -> Unit,
    modifier: Modifier = Modifier
) {
    Column(modifier = modifier) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                label,
                style = MaterialTheme.typography.bodyLarge,
                modifier = Modifier.weight(1f)
            )
            Text(
                "${(value.coerceIn(SLIDER_MIN, SLIDER_MAX) * 100).roundToInt()}%",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        Slider(
            value = value.coerceIn(SLIDER_MIN, SLIDER_MAX),
            onValueChange = onValueChange,
            valueRange = SLIDER_MIN..SLIDER_MAX,
            modifier = Modifier.fillMaxWidth()
        )
    }
}
