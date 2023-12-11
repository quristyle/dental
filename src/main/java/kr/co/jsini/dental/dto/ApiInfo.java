package kr.co.jsini.dental.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApiInfo {
  String scima_name;
  String package_name;  
  String procedule_name;
  String proceStr;
  int sequence;
  List<ProcInfo> pis;
}
