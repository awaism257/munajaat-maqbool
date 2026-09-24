package org.munajaat.maqbool.ui.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import org.munajaat.maqbool.ui.theme.appCardColors
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmarks
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
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
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.munajaat.maqbool.AppViewModel
import org.munajaat.maqbool.ui.common.ContentStateView

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    viewModel: AppViewModel,
    onOpenDay: (String) -> Unit,
    onOpenSearch: () -> Unit,
    onOpenBookmarks: () -> Unit,
    onOpenSettings: () -> Unit
) {
    Scaffold(
        containerColor = Color.Transparent,
        topBar = {
            TopAppBar(
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.Transparent),
                title = {
                    // The header is branding, not reading content: counter the
                    // system font scale so it never wraps or clips on devices
                    // with very large accessibility font sizes.
                    val fontScale = LocalDensity.current.fontScale
                    Column {
                        Text(
                            text = "Munajaat Maqbool",
                            fontSize = (22f / fontScale).coerceAtLeast(12f).sp,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        Text(
                            text = "The Accepted Whispers",
                            fontSize = (12f / fontScale).coerceAtLeast(8f).sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                },
                actions = {
                    IconButton(onClick = onOpenSearch) {
                        Icon(Icons.Filled.Search, contentDescription = "Search")
                    }
                    IconButton(onClick = onOpenBookmarks) {
                        Icon(Icons.Filled.Bookmarks, contentDescription = "Bookmarks")
                    }
                    IconButton(onClick = onOpenSettings) {
                        Icon(Icons.Filled.Settings, contentDescription = "Settings")
                    }
                }
            )
        }
    ) { padding ->
        Box(modifier = Modifier.padding(padding).fillMaxSize()) {
            Column {
                HorizontalDivider(
                    thickness = 3.dp,
                    color = MaterialTheme.colorScheme.primary
                )
                ContentStateView(viewModel = viewModel) { content ->
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(start = 16.dp, top = 24.dp, end = 16.dp, bottom = 24.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp, Alignment.CenterVertically)
                ) {
                    itemsIndexed(content.days, key = { _, day -> day.id }) { index, day ->
                        Card(
                            onClick = { onOpenDay(day.id) },
                            modifier = Modifier.fillMaxWidth(),
                            colors = appCardColors()
                        ) {
                            ListItem(
                                colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                                headlineContent = { Text(day.title) },
                                supportingContent = { Text("${day.items.size} duas") },
                                trailingContent = {
                                    Icon(Icons.Filled.ChevronRight, contentDescription = null)
                                }
                            )
                        }
                    }
                }
                }
            }
        }
    }
}
