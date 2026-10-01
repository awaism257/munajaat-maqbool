cmake_minimum_required(VERSION 3.16)
project(munajaat-maqbool LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_AUTOMOC ON)

find_package(Qt6 REQUIRED COMPONENTS Widgets WebEngineWidgets)

add_executable(munajaat-maqbool main.cpp)
target_link_libraries(munajaat-maqbool PRIVATE Qt6::Widgets Qt6::WebEngineWidgets)

include(GNUInstallDirs)

install(TARGETS munajaat-maqbool RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR})

# Install web application assets to <prefix>/share/munajaat-maqbool/www
install(DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/../assets
                  ${CMAKE_CURRENT_SOURCE_DIR}/../fonts
        DESTINATION ${CMAKE_INSTALL_DATADIR}/munajaat-maqbool/www)

install(FILES ${CMAKE_CURRENT_SOURCE_DIR}/../index.html
              ${CMAKE_CURRENT_SOURCE_DIR}/../app.js
              ${CMAKE_CURRENT_SOURCE_DIR}/../styles.css
              ${CMAKE_CURRENT_SOURCE_DIR}/desktop.css
              ${CMAKE_CURRENT_SOURCE_DIR}/../manifest.webmanifest
        DESTINATION ${CMAKE_INSTALL_DATADIR}/munajaat-maqbool/www)

# Install desktop file, metainfo, and icons
install(FILES ${CMAKE_CURRENT_SOURCE_DIR}/io.github.awaism257.munajaat-maqbool.desktop
        DESTINATION ${CMAKE_INSTALL_DATADIR}/applications)

install(FILES ${CMAKE_CURRENT_SOURCE_DIR}/io.github.awaism257.munajaat-maqbool.metainfo.xml
        DESTINATION ${CMAKE_INSTALL_DATADIR}/metainfo)

install(FILES ${CMAKE_CURRENT_SOURCE_DIR}/icons/icon-64.png
        DESTINATION ${CMAKE_INSTALL_DATADIR}/icons/hicolor/64x64/apps
        RENAME io.github.awaism257.munajaat-maqbool.png)

install(FILES ${CMAKE_CURRENT_SOURCE_DIR}/icons/icon-128.png
        DESTINATION ${CMAKE_INSTALL_DATADIR}/icons/hicolor/128x128/apps
        RENAME io.github.awaism257.munajaat-maqbool.png)

install(FILES ${CMAKE_CURRENT_SOURCE_DIR}/icons/icon-256.png
        DESTINATION ${CMAKE_INSTALL_DATADIR}/icons/hicolor/256x256/apps
        RENAME io.github.awaism257.munajaat-maqbool.png)
