Requisites:
    - should have dynamic routes
    - should generate said dynamic routes with "getStaticProps" or smth similar
    - should have as little dependencies as possible: template Edge because it rocks
    - should be easy to use and hide as little magic as possible
    - in general, should follow this premise: Writing dynamic HTML is super useful, but not so much with assets and stuff

What is not:
    - not SSR or building apps. Server will only run in dev and build time
    - fuck file based routing