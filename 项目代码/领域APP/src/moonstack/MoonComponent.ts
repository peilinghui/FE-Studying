import React, { Component } from 'react';
import MoonKernel from './MoonKernel';

export default class MoonComponent<Props, State> extends Component<Props, State> {

  protected moon: MoonKernel;

  constructor(props: Props, identifier: string) {
    super(props);
    this.moon = new MoonKernel(identifier, this);
  }

}