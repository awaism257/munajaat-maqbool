import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.plugin.compose")
    id("org.jetbrains.kotlin.plugin.serialization")
}

// Optional local release signing. The properties file lives outside the repo
// (default: ../../Credentials/signing.properties, or $MUNAJAAT_SIGNING_PROPS)
// and is never committed. Without it — e.g. on F-Droid's build server — the
// release build is left unsigned, exactly as before.
val signingPropsFile = System.getenv("MUNAJAAT_SIGNING_PROPS")?.let { file(it) }
    ?: rootProject.file("../../Credentials/signing.properties")
val signingProps = Properties().apply {
    if (signingPropsFile.isFile) signingPropsFile.inputStream().use { load(it) }
}
val hasSigning = listOf("storeFile", "storePassword", "keyAlias", "keyPassword")
    .all { !signingProps.getProperty(it).isNullOrBlank() } &&
    signingProps.values.none { it.toString().startsWith("PASTE_") }

android {
    namespace = "org.munajaat.maqbool"
    buildToolsVersion = "37.0.0"
    compileSdk = 37

    defaultConfig {
        applicationId = "org.munajaat.maqbool"
        minSdk = 24
        targetSdk = 37
        versionCode = 25
        versionName = "1.3.2"
    }

    signingConfigs {
        if (hasSigning) {
            create("release") {
                storeFile = signingPropsFile.parentFile.resolve(signingProps.getProperty("storeFile"))
                storePassword = signingProps.getProperty("storePassword")
                keyAlias = signingProps.getProperty("keyAlias")
                keyPassword = signingProps.getProperty("keyPassword")
                // Match the v2+v3 schemes of earlier apksigner-signed releases.
                enableV3Signing = true
            }
        }
    }

    buildTypes {
        release {
            if (hasSigning) signingConfig = signingConfigs.getByName("release")
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            // Required for F-Droid reproducible builds: the embedded VCS info
            // (commit hash / clone path) is environment-specific.
            vcsInfo.include = false
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    buildFeatures {
        compose = true
    }
    // F-Droid rejects APKs carrying AGP's "Dependency metadata" signing block.
    dependenciesInfo {
        includeInApk = false
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    val composeBom = platform("androidx.compose:compose-bom:2024.02.02")
    implementation(composeBom)
    androidTestImplementation(composeBom)

    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.activity:activity-compose:1.8.2")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.7.0")

    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")

    implementation("androidx.navigation:navigation-compose:2.7.7")
    implementation("androidx.datastore:datastore-preferences:1.1.1")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.3")

    debugImplementation("androidx.compose.ui:ui-tooling")
    testImplementation("junit:junit:4.13.2")
}

kotlin {
    compilerOptions {
        jvmTarget = org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17
    }
}
