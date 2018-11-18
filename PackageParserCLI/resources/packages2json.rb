#!/usr/bin/env ruby

require 'fileutils'
require 'json'
require 'strscan'
require 'zlib'

def parse(file)
  case file
  when /\.bz2$/
    raise(NotImplementedError.new("bzip2 is not supported: #{file}"))
  when /\.gz$/
    bytes = nil
    Zlib::GzipReader.open(file) { |fp|
      bytes = fp.read()
    }
  else
    bytes = File.read(file)
  end
  scan = StringScanner.new(bytes)
  lineno = 1
  repo = []
  package = {}
  until scan.eos?
    if key = scan.scan(/\A[A-Z][-0-9A-Za-z]*[0-9A-Za-z]/)
      scan.skip(/\A\s*:\s*/)
      val = scan.scan(/\A.*$/)
      scan.skip(/\A\r?\n/)
      lineno += 1
      while scan.skip(/\A[\t ]/)
        val += "\n"
        unless scan.skip(/\A\.$/) # ignore dot line
          val += scan.scan(/\A.*$/)
        end
        scan.skip(/\A\r?\n/)
        lineno += 1
      end
      if /^\d+$/ =~ val
        package[key.to_sym] = val.to_i
      elsif /^\d+\.\d+$/ =~ val
        package[key.to_sym] = val.to_f
      else
        package[key.to_sym] = val
      end
    elsif scan.skip(/^$/)
      while scan.skip(/\A\r?\n/)
        lineno += 1
      end
      repo << package
      package = {}
    else
      raise(SyntaxError.new("must not happen"))
    end
  end
  repo
end

def parse_multi(files=[])
  repo = []
  files.each { |file|
    repo += parse(file)
  }
  repo
end

repo = parse_multi(ARGV)
STDOUT.puts(repo.to_json())

# vim:set ft=ruby sw=2 ts=2 :