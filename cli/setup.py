"""
"""

from os import path

from setuptools import find_packages, setup # type: ignore

here = path.abspath(path.dirname(__file__))

with open(path.join(here, 'README.md'), encoding='utf-8') as f:
  long_description = f.read()

setup(
    name='theia-open',
    version='0.1.2',
    description='A command line to open file from within theia',
    long_description=long_description,
    url='https://github.com/perrinjerome/theia-open/',
    long_description_content_type='text/markdown',
    classifiers=[
        'Intended Audience :: Developers',
        'Topic :: Software Development',
        'License :: OSI Approved :: MIT License',
        'Programming Language :: Python :: 3',
    ],
    keywords='theia editor',
    packages=find_packages(),
    python_requires='>=3.6.*',
    install_requires=[
        'requests',
    ],
    entry_points={
        'console_scripts': [
            'theia-open=theia_open.cli:main',
        ],
    },
)
