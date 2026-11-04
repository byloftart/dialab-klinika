#!/usr/bin/env python3
"""Verify and decrypt this repository's complete AWS recovery snapshot."""
import argparse, hashlib, json, os, pathlib, shutil, stat, subprocess, tarfile, tempfile

def digest(path):
    h=hashlib.sha256()
    with path.open('rb') as f:
        for block in iter(lambda:f.read(1024*1024),b''):h.update(block)
    return h.hexdigest()

def extract_safely(archive_path, destination):
    # Write regular files first and create symbolic links last. No archive path may escape.
    links=[]
    with tarfile.open(archive_path,'r:gz') as archive:
        for member in archive:
            relative=pathlib.PurePosixPath(member.name)
            if relative.is_absolute() or '..' in relative.parts:
                raise RuntimeError('Unsafe archive path')
            target=destination.joinpath(*relative.parts)
            if member.issym():
                links.append((target,member.linkname));continue
            if member.isdir():
                target.mkdir(parents=True,exist_ok=True)
            elif member.isfile():
                target.parent.mkdir(parents=True,exist_ok=True)
                with archive.extractfile(member) as source, target.open('xb') as output:
                    shutil.copyfileobj(source,output)
                target.chmod(stat.S_IMODE(member.mode) & 0o777)
            else:
                raise RuntimeError('Unsupported archive entry')
        for target,link in links:
            if target.exists() or target.is_symlink():
                raise RuntimeError('Duplicate archive symlink path')
            target.parent.mkdir(parents=True,exist_ok=True)
            target.symlink_to(link)

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--passphrase-file',type=pathlib.Path,required=True)
    parser.add_argument('--output-dir',type=pathlib.Path,required=True)
    args=parser.parse_args()
    os.umask(0o077)
    source=pathlib.Path(__file__).resolve().parent
    manifest=json.loads((source/'manifest.json').read_text())
    destination=args.output_dir.resolve()
    if destination.exists() and any(destination.iterdir()):
        raise RuntimeError('Output directory must be empty')
    destination.mkdir(parents=True,mode=0o700,exist_ok=True)
    destination.chmod(0o700)
    if not args.passphrase_file.is_file():raise RuntimeError('Missing recovery passphrase file')
    with tempfile.TemporaryDirectory(prefix='.recovery-',dir=destination.parent) as temporary:
        temporary=pathlib.Path(temporary)
        encrypted=temporary/'snapshot.tar.gz.gpg'
        with encrypted.open('wb') as output:
            for chunk in manifest['chunks']:
                path=source/chunk['name']
                if path.stat().st_size!=chunk['bytes'] or digest(path)!=chunk['sha256']:
                    raise RuntimeError('Encrypted chunk checksum mismatch: '+chunk['name'])
                with path.open('rb') as part:shutil.copyfileobj(part,output)
        decrypted=temporary/'snapshot.tar.gz'
        home=temporary/'gnupg';home.mkdir(mode=0o700)
        subprocess.run(['gpg','--no-options','--homedir',str(home),'--batch','--pinentry-mode','loopback','--no-symkey-cache','--passphrase-file',str(args.passphrase_file.resolve()),'--output',str(decrypted),'--decrypt',str(encrypted)],check=True)
        if digest(decrypted)!=manifest['plaintext_archive_sha256']:
            raise RuntimeError('Decrypted archive checksum mismatch')
        extract_safely(decrypted,destination)
    # Verify original remote file checksums again after extraction.
    remote=json.loads((destination/'export'/'SHA256-MANIFEST.private.json').read_text())
    for entry in remote['files']:
        path=destination/'export'/entry['path']
        if 'symlink' in entry:
            if not path.is_symlink() or os.readlink(path)!=entry['symlink']:raise RuntimeError('Recovered symlink differs')
        elif digest(path)!=entry['sha256']:
            raise RuntimeError('Recovered file differs: '+entry['path'])
    cloud=destination/'cloud'/'s3-verification.json'
    if cloud.exists():
        for entry in json.loads(cloud.read_text())['objects']:
            if digest(destination/'cloud'/'s3-current-objects'/entry['key'])!=entry['sha256']:
                raise RuntimeError('Recovered S3 object differs')
    print('Snapshot decrypted and all original file checksums verified:',destination)

if __name__=='__main__':main()
