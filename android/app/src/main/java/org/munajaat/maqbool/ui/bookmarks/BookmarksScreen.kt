package org.munajaat.maqbool.ui.bookmarks

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.BookmarkRemove
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ListItem
import androidx.compose.material3.ListItemDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import org.munajaat.maqbool.ui.theme.appCardColors
import org.munajaat.maqbool.AppViewModel
import org.munajaat.maqbool.data.PrefsRepository
import org.munajaat.maqbool.ui.common.ContentStateView

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BookmarksScreen(
    viewModel: AppViewModel,
    onBack: () -> Unit,
    onOpenItem: (dayId: String, item: Int) -> Unit
) {
    val prefs by viewModel.prefs.collectAsState()

    ContentStateView(viewModel = viewModel) { content ->
        val bookmarked = content.days.flatMap { day ->
            day.items
                .filter { PrefsRepository.bookmarkKey(day.id, it.n) in prefs.bookmarks }
                .map { Triple(day, it, PrefsRepository.bookmarkKey(day.id, it.n)) }
        }

        Scaffold(
        containerColor = Color.Transparent,
            topBar = {
                TopAppBar(
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.Transparent),
                    title = { Text("Bookmarks", maxLines = 1, overflow = TextOverflow.Ellipsis) },
                    navigationIcon = {
                        IconButton(onClick = onBack) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                        }
                    }
                )
            }
        ) { padding ->
            if (bookmarked.isEmpty()) {
                Column(
                    modifier = Modifier.fillMaxSize().padding(padding),
                    verticalArrangement = Arrangement.Center,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        "No bookmarks yet",
                        style = MaterialTheme.typography.titleMedium
                    )
                    Text(
                        "Tap the bookmark icon on any dua to save it here.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(top = 8.dp, start = 24.dp, end = 24.dp)
                    )
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize().padding(padding),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(bookmarked, key = { it.third }) { (day, item, _) ->
                        Card(onClick = { onOpenItem(day.id, item.n) }, colors = appCardColors()) {
                            ListItem(
                                colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                                overlineContent = { Text("${day.title} · #${item.n}") },
                                headlineContent = {
                                    Text(
                                        item.english,
                                        maxLines = 2,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                },
                                trailingContent = {
                                    IconButton(onClick = { viewModel.toggleBookmark(day.id, item.n) }) {
                                        Icon(
                                            Icons.Filled.BookmarkRemove,
                                            contentDescription = "Remove bookmark"
                                        )
                                    }
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}
