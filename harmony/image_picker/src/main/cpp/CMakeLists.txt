# the minimum version of CMake.
cmake_minimum_required(VERSION 3.13)
set(CMAKE_VERBOSE_MAKEFILE on)

file(GLOB rnoh_image_picker_SRC CONFIGURE_DEPENDS *.cpp)
add_library(rnoh_image_picker SHARED ${rnoh_image_picker_SRC})
target_include_directories(rnoh_image_picker PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})
target_link_libraries(rnoh_image_picker PUBLIC rnoh)