package org.munajaat.maqbool.ui.credits

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.munajaat.maqbool.ui.theme.appCardColors

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreditsScreen(
    onBack: () -> Unit
) {
    val uriHandler = LocalUriHandler.current
    Scaffold(
        containerColor = Color.Transparent,
        topBar = {
            TopAppBar(
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.Transparent),
                title = { Text("Credits", maxLines = 1, overflow = TextOverflow.Ellipsis) },
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
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            /* Header card */
            Card(colors = appCardColors(), modifier = Modifier.fillMaxWidth()) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        "Munajaat Maqbool",
                        style = MaterialTheme.typography.headlineSmall,
                        fontFamily = FontFamily.Serif,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary,
                        textAlign = TextAlign.Center
                    )
                    Text(
                        "Free · No ads · No sign-in · No tracking · Offline",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(top = 8.dp, bottom = 6.dp)
                    )
                    Text(
                        "munajaat-maqbool.netlify.app",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.secondary,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.clickable {
                            uriHandler.openUri("https://munajaat-maqbool.netlify.app")
                        }
                    )
                }
            }

            /* Texts & licences card */
            Card(colors = appCardColors(), modifier = Modifier.fillMaxWidth()) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    AboutHeading("TEXTS & LICENCES")
                    AboutRow(
                        "Original work",
                        "Munajaat-e-Maqbool by Mawlana Ashraf Ali Thanawi (rahimahullah) — public domain"
                    )
                    AboutRow(
                        "Qur'anic supplications",
                        "ClearQuran translation by Dr. Talal Itani (clearquran.com) — CC BY-ND 4.0"
                    )
                    AboutRow(
                        "Other supplications",
                        "Fresh plain-English translation in the ClearQuran register, reviewed against the Urdu translation"
                    )
                }
            }

            /* Fonts card */
            Card(colors = appCardColors(), modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(20.dp)) {
                    AboutHeading("FONTS")
                    Text(
                        "Digital Khatt IndoPak (© 2024-2025 Amine Anane, Tarteel Inc.) · Amiri · Noto Nastaliq Urdu — SIL Open Font License",
                        style = MaterialTheme.typography.bodyLarge,
                        modifier = Modifier.padding(top = 14.dp)
                    )
                }
            }

            /* Project page card */
            Card(colors = appCardColors(), modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(20.dp)) {
                    AboutHeading("PROJECT PAGE")
                    Text(
                        "News, source code and ways to support the project:",
                        style = MaterialTheme.typography.bodyLarge,
                        modifier = Modifier.padding(top = 14.dp)
                    )
                    Text(
                        "awaism257.github.io/munajaat-maqbool/support.html",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.secondary,
                        modifier = Modifier
                            .padding(top = 6.dp)
                            .clickable { uriHandler.openUri("https://awaism257.github.io/munajaat-maqbool/support.html") }
                    )
                }
            }

            /* Footer lines */
            Text(
                "Compiled by Awais Mahmood with the help of Kimi K3 AI.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )
            Text(
                "Distributed free of charge.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.secondary,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}

@Composable
private fun AboutHeading(text: String) {
    Text(
        text,
        style = MaterialTheme.typography.labelMedium,
        fontWeight = FontWeight.SemiBold,
        letterSpacing = 1.5.sp,
        color = MaterialTheme.colorScheme.secondary
    )
}

@Composable
private fun AboutRow(label: String, value: String) {
    Row(modifier = Modifier.fillMaxWidth()) {
        Text(
            label,
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier
                .weight(0.38f)
                .padding(end = 16.dp)
        )
        Text(
            value,
            style = MaterialTheme.typography.bodyLarge,
            modifier = Modifier.weight(0.62f)
        )
    }
}
