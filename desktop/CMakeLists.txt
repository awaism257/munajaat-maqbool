cmake_minimum_required(VERSION 3.16)
project(munajaat-maqbool LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_AUTOMOC ON)

find_package(Qt6 REQUIRED COMPONENTS Widgets WebEngineWidgets)

add_executable(munajaat-maqbool main.cpp)
target_link_libraries(munajaat-maqbool PRIVATE Qt6::Widgets Qt6::WebEngineWidgets)

install(TARGETS munajaat-maqbool RUNTIME DESTINATION bin)
