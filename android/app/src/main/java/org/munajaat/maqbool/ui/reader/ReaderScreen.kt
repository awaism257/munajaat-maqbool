package org.munajaat.maqbool.ui.reader

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import org.munajaat.maqbool.AppViewModel
import org.munajaat.maqbool.ui.common.ContentStateView

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReaderScreen(
    viewModel: AppViewModel,
    dayId: String,
    initialItem: Int,
    onBack: () -> Unit,
    onNavigateDay: (String) -> Unit
) {
    ContentStateView(viewModel = viewModel) { content ->
        val dayIndex = content.days.indexOfFirst { it.id == dayId }
        if (dayIndex < 0) {
            Column404(onBack)
            return@ContentStateView
        }
        val day = content.days[dayIndex]
        val prefs by viewModel.prefs.collectAsState()
        val listState = rememberLazyListState()

        LaunchedEffect(dayId, initialItem) {
            val index = (initialItem - 1).coerceIn(0, day.items.lastIndex)
            listState.scrollToItem(index)
        }

        Scaffold(
        containerColor = Color.Transparent,
            topBar = {
                TopAppBar(
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.Transparent),
                    title = { Text(day.title, maxLines = 1, overflow = TextOverflow.Ellipsis) },
                    navigationIcon = {
                        IconButton(onClick = onBack) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                        }
                    }
                )
            },
            bottomBar = {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(
                        onClick = { onNavigateDay(content.days[dayIndex - 1].id) },
                        enabled = dayIndex > 0
                    ) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Previous day")
                    }
                    Text(
                        text = "${day.items.size} duas",
                        style = MaterialTheme.typography.labelLarge
                    )
                    IconButton(
                        onClick = { onNavigateDay(content.days[dayIndex + 1].id) },
                        enabled = dayIndex < content.days.lastIndex
                    ) {
                        Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = "Next day")
                    }
                }
            }
        ) { padding ->
            LazyColumn(
                state = listState,
                modifier = Modifier.fillMaxSize().padding(padding),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(day.items, key = { it.n }) { item ->
                    DuaCard(
                        item = item,
                        arabicFontScale = prefs.arabicFontScale,
                        englishFontScale = prefs.englishFontScale,
                        urduFontScale = prefs.urduFontScale,
                        transliterationFontScale = prefs.transliterationFontScale,
                        arabicLineSpacing = prefs.arabicLineSpacing,
                        showEnglish = prefs.showEnglish,
                        showUrdu = prefs.showUrdu,
                        showTransliteration = prefs.showTransliteration,
                        isBookmarked = viewModel.isBookmarked(day.id, item.n),
                        onToggleBookmark = { viewModel.toggleBookmark(day.id, item.n) }
                    )
                }
            }
        }
    }
}

@Composable
private fun Column404(onBack: () -> Unit) {
    androidx.compose.foundation.layout.Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("Section not found", style = MaterialTheme.typography.headlineSmall)
        IconButton(onClick = onBack) {
            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
        }
    }
}
