# Dennis

Dennis is a DNS proxy intended to work in Mac OS X. In principle, it
allows the user to map any domain to any other domain. It is meant to
be used in conjunction with the
[resolver](https://developer.apple.com/library/mac/documentation/Darwin/Reference/ManPages/man5/resolver.5.html)
system.

For example it can be used to map any lookup of a `.ilovemyself`
domain to `.com`.

## Installation

Dennis is most easily installed using

    $ npm install -g dennis

Dennis needs a configuration file, which is read from
`~/.dennis.json`. Then run

    $ dennis install

to get instructions for how dennis can be run in the background.

## Configuration

An example Dennis configuration located in `~/.dennis.json` looks like

```json
{
  "port": 1553,
  "domains": {
    "ilovemyself": {
      "host": "8.8.8.8",
      "suffix": "com"
    }
  }
}
```

This configuration would make Dennis run on port 1553. For any query
to a `.ilovemyself` domain, let's say `example.ilovemyself`, it would
proxy the query to `8.8.8.8` but rewrite the name to `example.net`.
Effectively Dennis would make `.ilovemyself` a mirror of `.net`.

The options for the configuration are:

* `port` (default: 1553) -- the port which Dennis will bind to
* `domains` (required)

Each key of `domains` is a domain to proxy, for which the following
options are accepted:

* `host` (required) -- the host to proxy the request to
* `port` (default: 53) -- the port to use
* `suffix` (optional) -- the suffix to append to the domain, after
  removing the key itself. If no suffix is specified nothing will be
  appended. For example, given a request for `example.com` the proxy
  request will be `example`.
* `proto` (default: udp) -- the protocol to use, `udp` or `tcp`
* `timeout` (default: 1000) -- the number of milliseconds before
  considering the request timed out  

## Setting up resolver

For each entry to `domains` a corresponding mapping in the resolver
system is required for Dennis to be used as a proxy. Let's say you
want to use dennis for `.ilovemyself`. Then create
`/etc/resolver/ilovemyself` with contents:

```
nameserver 127.0.0.1
port 1553
```
