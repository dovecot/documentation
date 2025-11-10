# PlantUML Data

This directory contains PlantUML files that are used to create diagrams for
the documentation.

## Docker

[PlantUML](https://plantuml.com/) files are converted to SVG by using a Java
program.

It is easiest to run the program by using a pre-configured Docker container.

The output command is as follows:

```
docker run --rm -v /path/to/your/puml/files:/data \
  -v /path/to/your/output/directory:/output plantuml/plantuml \
  -tsvg /data/your_diagram.puml \
  -o /output
```

For example, if running from this directory to convert foo.puml, and storing
the SVG file in the "docs/core/images" directory (so it can be referenced via
Markdown from within VitePress), run:

```
mkdir -p ../../docs/core/images
docker run --rm -v ./:/data -v ../../docs/core/images:/output \
  plantuml/plantuml -tsvg /data/foo.puml -o /output
```
