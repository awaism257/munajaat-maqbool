package org.munajaat.maqbool.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import org.munajaat.maqbool.AppViewModel
import org.munajaat.maqbool.ui.bookmarks.BookmarksScreen
import org.munajaat.maqbool.ui.credits.CreditsScreen
import org.munajaat.maqbool.ui.home.HomeScreen
import org.munajaat.maqbool.ui.reader.ReaderScreen
import org.munajaat.maqbool.ui.search.SearchScreen
import org.munajaat.maqbool.ui.settings.SettingsScreen

object Routes {
    const val HOME = "home"
    const val SEARCH = "search"
    const val BOOKMARKS = "bookmarks"
    const val SETTINGS = "settings"
    const val CREDITS = "credits"
    const val READER = "reader/{dayId}?item={item}"
    fun reader(dayId: String, item: Int = 1) = "reader/$dayId?item=$item"
}

@Composable
fun AppNavGraph(
    viewModel: AppViewModel,
    navController: NavHostController = rememberNavController()
) {
    NavHost(navController = navController, startDestination = Routes.HOME) {
        composable(Routes.HOME) {
            HomeScreen(
                viewModel = viewModel,
                onOpenDay = { dayId -> navController.navigate(Routes.reader(dayId)) },
                onOpenSearch = { navController.navigate(Routes.SEARCH) },
                onOpenBookmarks = { navController.navigate(Routes.BOOKMARKS) },
                onOpenSettings = { navController.navigate(Routes.SETTINGS) }
            )
        }
        composable(
            route = Routes.READER,
            arguments = listOf(
                navArgument("dayId") { type = NavType.StringType },
                navArgument("item") { type = NavType.IntType; defaultValue = 1 }
            )
        ) { entry ->
            val dayId = entry.arguments?.getString("dayId").orEmpty()
            val item = entry.arguments?.getInt("item") ?: 1
            ReaderScreen(
                viewModel = viewModel,
                dayId = dayId,
                initialItem = item,
                onBack = { navController.popBackStack() },
                onNavigateDay = { newDay -> navController.navigate(Routes.reader(newDay)) }
            )
        }
        composable(Routes.SEARCH) {
            SearchScreen(
                viewModel = viewModel,
                onBack = { navController.popBackStack() },
                onOpenResult = { dayId, item -> navController.navigate(Routes.reader(dayId, item)) }
            )
        }
        composable(Routes.BOOKMARKS) {
            BookmarksScreen(
                viewModel = viewModel,
                onBack = { navController.popBackStack() },
                onOpenItem = { dayId, item -> navController.navigate(Routes.reader(dayId, item)) }
            )
        }
        composable(Routes.SETTINGS) {
            SettingsScreen(
                viewModel = viewModel,
                onBack = { navController.popBackStack() },
                onOpenCredits = { navController.navigate(Routes.CREDITS) }
            )
        }
        composable(Routes.CREDITS) {
            CreditsScreen(
                onBack = { navController.popBackStack() }
            )
        }
    }
}
