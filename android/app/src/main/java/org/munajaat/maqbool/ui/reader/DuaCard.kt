package org.munajaat.maqbool.ui.reader

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.outlined.ContentCopy
import androidx.compose.material3.Badge
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.style.BaselineShift
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.munajaat.maqbool.data.DuaItem
import org.munajaat.maqbool.ui.theme.arabicFontFamily
import org.munajaat.maqbool.ui.theme.appCardColors
import org.munajaat.maqbool.ui.theme.urduFontFamily

/**
 * A single dua card: number badge, RTL Arabic block, English translation,
 * and an expandable footnotes section.
 */
@Composable
fun DuaCard(
    item: DuaItem,
    arabicFontScale: Float,
    englishFontScale: Float,
    urduFontScale: Float = 1.0f,
    transliterationFontScale: Float = 1.0f,
    arabicLineSpacing: Float = 1.0f,
    showEnglish: Boolean,
    showUrdu: Boolean = false,
    showTransliteration: Boolean = false,
    isBookmarked: Boolean,
    onToggleBookmark: () -> Unit,
    modifier: Modifier = Modifier
) {
    var footnotesExpanded by rememberSaveable(item.n) { mutableStateOf(false) }
    var copied by rememberSaveable(item.n) { mutableStateOf(false) }
    val clipboardManager = LocalClipboardManager.current

    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = appCardColors()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Badge(containerColor = MaterialTheme.colorScheme.primary) {
                    Text(
                        text = "${item.n}",
                        color = MaterialTheme.colorScheme.onPrimary,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(
                        onClick = {
                            // Copy exactly what is visible: Arabic always, then Urdu
                            // and/or English only when their toggles are on.
                            val parts = mutableListOf(item.arabic)
                            if (showTransliteration && item.transliteration.isNotBlank()) parts.add(item.transliteration)
                            if (showUrdu && item.urdu.isNotBlank()) parts.add(item.urdu)
                            if (showEnglish) parts.add(item.english)
                            if (item.footnotes.isNotEmpty()) {
                                parts.add("Reference:\n" + item.footnotes.joinToString("\n"))
                            }
                            clipboardManager.setText(AnnotatedString(parts.joinToString("\n\n")))
                            copied = true
                        }
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.ContentCopy,
                            contentDescription = "Copy dua",
                            tint = if (copied) MaterialTheme.colorScheme.primary
                            else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    IconButton(onClick = onToggleBookmark) {
                    Icon(
                        imageVector = if (isBookmarked) Icons.Filled.Bookmark else Icons.Filled.BookmarkBorder,
                        contentDescription = if (isBookmarked) "Remove bookmark" else "Bookmark",
                        tint = MaterialTheme.colorScheme.primary
                    )
                    }
                }
            }

            // Arabic block, right-aligned RTL
            androidx.compose.runtime.CompositionLocalProvider(
                androidx.compose.ui.platform.LocalLayoutDirection provides LayoutDirection.Rtl
            ) {
                Text(
                    text = item.arabic,
                    modifier = Modifier.fillMaxWidth(),
                    fontFamily = arabicFontFamily(),
                    fontSize = (24 * arabicFontScale).sp,
                    lineHeight = (40 * arabicFontScale * arabicLineSpacing).sp,
                    textAlign = TextAlign.Start
                )
            }

            // Optional transliteration block, left-aligned LTR, between Arabic and Urdu
            if (showTransliteration && item.transliteration.isNotBlank()) {
                HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))
                androidx.compose.runtime.CompositionLocalProvider(
                    androidx.compose.ui.platform.LocalLayoutDirection provides LayoutDirection.Ltr
                ) {
                    Text(
                        text = item.transliteration,
                        modifier = Modifier.fillMaxWidth(),
                        fontStyle = androidx.compose.ui.text.font.FontStyle.Italic,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontSize = (16 * transliterationFontScale).sp,
                        textAlign = TextAlign.Start
                    )
                }
            }

            // Optional Urdu block, right-aligned RTL, between Arabic and English
            if (showUrdu && item.urdu.isNotBlank()) {
                HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))
                androidx.compose.runtime.CompositionLocalProvider(
                    androidx.compose.ui.platform.LocalLayoutDirection provides LayoutDirection.Rtl
                ) {
                    Text(
                        text = item.urdu,
                        modifier = Modifier.fillMaxWidth(),
                        fontFamily = urduFontFamily(),
                        fontSize = (20 * urduFontScale).sp,
                        lineHeight = (34 * urduFontScale).sp,
                        textAlign = TextAlign.Start
                    )
                }
            }

            if (showEnglish) {
                HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))
                // Footnote markers are only needed when an item has multiple footnotes;
                // with a single footnote the expandable section below is unambiguous.
                val markerColor = MaterialTheme.colorScheme.secondary
                val englishText = remember(item.english, item.footnotes, markerColor) {
                    if (item.footnotes.size <= 1) {
                        AnnotatedString(item.english)
                    } else {
                        buildAnnotatedString {
                            append(item.english)
                            withStyle(
                                SpanStyle(
                                    color = markerColor,
                                    baselineShift = BaselineShift.Superscript,
                                    fontSize = 11.sp
                                )
                            ) {
                                item.footnotes.indices.forEach { i ->
                                    append(" [${i + 1}]")
                                }
                            }
                        }
                    }
                }
                Text(
                    text = englishText,
                    style = MaterialTheme.typography.bodyLarge.copy(
                        fontSize = (MaterialTheme.typography.bodyLarge.fontSize.value * englishFontScale).sp,
                        lineHeight = (MaterialTheme.typography.bodyLarge.lineHeight.value * englishFontScale).sp
                    )
                )
            }

            if (item.footnotes.isNotEmpty()) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { footnotesExpanded = !footnotesExpanded }
                        .padding(top = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = if (footnotesExpanded) Icons.Filled.ExpandLess else Icons.Filled.ExpandMore,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.secondary
                    )
                    Text(
                        text = when {
                            item.footnotes.size > 1 -> "References (${item.footnotes.size})"
                            item.footnotes[0].startsWith("Source cited:") -> "Reference"
                            else -> "Note"
                        },
                        style = MaterialTheme.typography.labelLarge,
                        color = MaterialTheme.colorScheme.secondary
                    )
                }
                AnimatedVisibility(visible = footnotesExpanded) {
                    Column(modifier = Modifier.padding(top = 4.dp)) {
                        item.footnotes.forEachIndexed { i, note ->
                            Text(
                                text = if (item.footnotes.size == 1) note else "${i + 1}. $note",
                                style = MaterialTheme.typography.bodySmall.copy(
                                    fontSize = (MaterialTheme.typography.bodySmall.fontSize.value * englishFontScale).sp
                                ),
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(vertical = 2.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}
