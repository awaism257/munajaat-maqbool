package org.munajaat.maqbool

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.Image
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.lifecycle.viewmodel.compose.viewModel
import org.munajaat.maqbool.data.ThemePreference
import org.munajaat.maqbool.ui.navigation.AppNavGraph
import org.munajaat.maqbool.ui.theme.MunajaatTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val vm: AppViewModel = viewModel()
            val prefs by vm.prefs.collectAsState()
            val darkTheme = when (prefs.theme) {
                ThemePreference.LIGHT -> false
                ThemePreference.DARK -> true
                ThemePreference.SYSTEM -> isSystemInDarkTheme()
            }
            MunajaatTheme(themePreference = prefs.theme) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    Box(modifier = Modifier.fillMaxSize()) {
                        Image(
                            painter = painterResource(R.drawable.bg_pattern),
                            contentDescription = null,
                            modifier = Modifier.fillMaxSize().alpha(if (darkTheme) 0.25f else 0.14f),
                            contentScale = ContentScale.Crop
                        )
                        AppNavGraph(viewModel = vm)
                    }
                }
            }
        }
    }
}
