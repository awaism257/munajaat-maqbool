package org.munajaat.maqbool.ui.common

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import org.munajaat.maqbool.AppViewModel
import org.munajaat.maqbool.ContentState
import org.munajaat.maqbool.data.Content

/**
 * Wraps screen content with loading and missing/invalid-content error states.
 */
@Composable
fun ContentStateView(
    viewModel: AppViewModel,
    modifier: Modifier = Modifier,
    content: @Composable (Content) -> Unit
) {
    val state by viewModel.contentState.collectAsState()
    when (val s = state) {
        is ContentState.Ready -> content(s.content)
        ContentState.Loading -> Column(
            modifier = modifier.fillMaxSize(),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) { CircularProgressIndicator() }
        is ContentState.Error -> Column(
            modifier = modifier.fillMaxSize().padding(24.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "Content unavailable",
                style = MaterialTheme.typography.headlineSmall,
                color = MaterialTheme.colorScheme.error
            )
            Text(
                text = s.message,
                style = MaterialTheme.typography.bodyMedium,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(top = 12.dp)
            )
            Button(onClick = { viewModel.reload() }, modifier = Modifier.padding(top = 16.dp)) {
                Text("Retry")
            }
        }
    }
}
